import { Request, Response } from 'express';
import { db } from "../../config/db";
//import moment from "moment";
import { Temporal } from 'temporal-polyfill';
interface EventCount {
  event: string;
  event_count: number;
}

interface UserLog {
  user_log_id: number;
  user: string;
  event: string;
  campaign_id: string;
  event_date: Date;
  full_name: string;
}

export class UserLogController {

  getLogsByUser = async (req: Request, res: Response): Promise<void> => {
  let { userId = 'all', event, startDate, endDate } = req.query;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const offset = (page - 1) * limit;

  try {
    // Si no hay fechas, usar la del día actual
    if (!startDate && !endDate) {
      const today = Temporal.Now.plainDateISO('UTC');
      startDate = today.toString();
      endDate = today.toString();
    }

    let eventCondition = '';
    switch (event) {
      case '1':
        eventCondition = "AND event = 'LOGIN'";
        break;
      case '2':
        eventCondition = "AND event = 'LOGOUT'";
        break;
      default:
        eventCondition = "AND event IN ('LOGIN', 'LOGOUT')";
    }

    const start = startDate
      ? Temporal.PlainDate.from(String(startDate)).toZonedDateTime('UTC').startOfDay().toString()
      : '';
    const end = endDate
      ? Temporal.PlainDate.from(String(endDate)).toZonedDateTime('UTC').with({ hour: 23, minute: 59, second: 59, millisecond: 999 }).toString()
      : start;

    const totalQueryParams: any[] = [];
    let totalQuery = `
      SELECT COUNT(*) as total
      FROM asterisk.vicidial_user_log
      WHERE 1=1
      ${userId !== 'all' ? 'AND user = ?' : ''}
      ${eventCondition}
      ${start ? 'AND event_date BETWEEN ? AND ?' : ''}
    `;

    if (userId !== 'all') totalQueryParams.push(userId);
    if (start) totalQueryParams.push(start, end);

    const [totalRows] = await db.query(totalQuery, totalQueryParams);
    const totalResult = (totalRows as { total: number }[])[0];
    const total = totalResult?.total || 0;

    let query = `
      SELECT l.user_log_id, l.user, l.event, l.campaign_id, l.event_date, u.full_name
      FROM asterisk.vicidial_user_log AS l
      INNER JOIN asterisk.vicidial_users AS u ON l.user = u.user
      WHERE 1=1
      ${eventCondition}
      ${userId !== 'all' ? 'AND l.user = ?' : ''}
      ${start ? 'AND l.event_date BETWEEN ? AND ?' : ''}
      ORDER BY l.event_date DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const queryParams: any[] = [];
    if (userId !== 'all') queryParams.push(userId);
    if (start) queryParams.push(start, end);

    const [logs] = await db.query(query, queryParams);
    const userLogs = logs as UserLog[];

    let countQuery = `
      SELECT event, COUNT(*) AS event_count
      FROM asterisk.vicidial_user_log AS l
      INNER JOIN asterisk.vicidial_users AS u ON l.user = u.user
      WHERE 1=1
      ${eventCondition}
      ${userId !== 'all' ? 'AND l.user = ?' : ''}
      ${start ? 'AND l.event_date BETWEEN ? AND ?' : ''}
      GROUP BY event
    `;

    const countQueryParams: any[] = [];
    if (userId !== 'all') countQueryParams.push(userId);
    if (start) countQueryParams.push(start, end);

    const [countResultRaw] = await db.query(countQuery, countQueryParams);
    const countResult = countResultRaw as EventCount[];

    const loginCount = countResult.find(c => c.event === 'LOGIN')?.event_count || 0;
    const logoutCount = countResult.find(c => c.event === 'LOGOUT')?.event_count || 0;

    if (userLogs.length === 0) {
      res.status(404).json({
        message: 'No se encontraron registros',
        loginCount: 0,
        logoutCount: 0,
        currentPage: page,
        totalPages: 0,
        totalItems: 0
      });
      return;
    }

    res.json({
      logs: userLogs,
      loginCount,
      logoutCount,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total
    });

  } catch (error) {
    console.error("Error al obtener logs:", error);
    res.status(500).json({
      error: "Error al procesar la solicitud",
      details: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : undefined
    });
  }
};


  getUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      // Consulta SQL para obtener los usuarios
      const query = 'SELECT user, full_name FROM asterisk.vicidial_users';
      const [result] = await db.query(query);

      if (Array.isArray(result) && result.length > 0) {
        res.json(result);  // Devuelve la lista de usuarios
      } else {
        res.status(404).json({ message: 'No se encontraron usuarios.' });
      }
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
      res.status(500).json({
        error: 'Error al obtener usuarios.',
        details: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : undefined,
      });
    }
  };


}
