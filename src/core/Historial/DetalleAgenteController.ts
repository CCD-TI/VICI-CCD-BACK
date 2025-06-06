import { Request, Response } from 'express';
import { db } from "../../config/db";
import moment from "moment";
import { Temporal } from 'temporal-polyfill';
import { mapTipificacion } from '../../Utils/utils';
import { AgenteTipificado } from '../../Dtos/AgenteTipificado';
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
    const { userId } = req.params;
    const { event, startDate, endDate } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    try {
      if (!userId) {
        res.status(400).json({ error: "Se requiere el ID de usuario" });
        return;
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
        ? moment.utc(String(startDate)).startOf('day').format('YYYY-MM-DD HH:mm:ss')
        : '';
      let end = endDate
        ? moment.utc(String(endDate)).endOf('day').format('YYYY-MM-DD HH:mm:ss')
        : startDate
        ? moment.utc(String(startDate)).endOf('day').format('YYYY-MM-DD HH:mm:ss')
        : '';
      /*
      const start = startDate 
        ? Temporal.PlainDate.from(String(startDate)).toZonedDateTime('UTC').startOfDay().toString()
        : '';
      let end = endDate
        ? Temporal.PlainDate.from(String(endDate)).toZonedDateTime('UTC').with({ hour: 23, minute: 59, second: 59, millisecond: 999 }).toString()
        : startDate
        ? Temporal.PlainDate.from(String(startDate)).toZonedDateTime('UTC').with({ hour: 23, minute: 59, second: 59, millisecond: 999 }).toString()
        : '';
      */
      let totalQuery = `
        SELECT COUNT(*) as total
        FROM asterisk.vicidial_user_log
        WHERE user = ? 
        ${eventCondition}
        ${start ? 'AND event_date BETWEEN ? AND ?' : ''}
      `;

      const totalQueryParams = [userId];
      if (start) {
        totalQueryParams.push(start, end || moment.utc(start).endOf('day').format('YYYY-MM-DD HH:mm:ss'));
        //totalQueryParams.push(start, end || Temporal.PlainDate.from(String(startDate)).toPlainDateTime('UTC').toString());
      }
      console.log(totalQuery, totalQueryParams);
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
      `;

      if (start && !end) {
        query += " AND l.event_date >= ? AND l.event_date <= ?";
      } else if (start && end) {
        query += " AND l.event_date BETWEEN ? AND ?";
      }

      query += ` ORDER BY l.event_date DESC LIMIT ${limit} OFFSET ${offset}`;

      const queryParams = [userId];
      if (start) {
        queryParams.push(start, end || moment.utc(start).endOf('day').format('YYYY-MM-DD HH:mm:ss'));
        //queryParams.push(start, end || Temporal.PlainDate.from(String(startDate)).toZonedDateTime('UTC').with({ hour: 23, minute: 59, second: 59, millisecond: 999 }).toString());
      }

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

      const [countResultRaw] = await db.query(countQuery, totalQueryParams);
      const countResult = countResultRaw as EventCount[];
      if (!Array.isArray(userLogs) || !Array.isArray(countResult)) {
        res.status(500).json({ error: "Error en el formato de respuesta de la base de datos" });
        return;
      }

      const loginCount = countResult.find(count => count.event === 'LOGIN')?.event_count || 0;
      const logoutCount = countResult.find(count => count.event === 'LOGOUT')?.event_count || 0;

      if (userLogs.length === 0) {
        res.status(404).json({ 
          message: 'No se encontraron registros para este usuario',
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
      console.error("Error al obtener logs de usuario:", error);
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

  getAgenteTipificado = async (req: Request, res: Response): Promise<void> => {
    try {
      const { user, startDate, endDate } = req.query;
      let query = `
      SELECT 
          vl.user, 
          vu.full_name, 
          vl.status, 
          COUNT(*) AS cantidad
      FROM 
          vicidial_list AS vl
      INNER JOIN 
          vicidial_users AS vu ON vl.user = vu.user
      WHERE 
          vl.status IN ('1101', '1102', '1202', '1201', '1203', '1301')
      `;
      if(user){
        query += `and vl.user = "${user}" ` 
      }
      if(startDate && endDate){
       query += `and vl.modify_date between "${startDate}" and "${endDate}" ` 
      }else{
        query += `and vl.modify_date > CURDATE() ` 
      }
      //agregando agrupacion
      query += `
      GROUP BY 
          vl.user, vl.status
      ORDER BY 
          vl.user, vl.status;`;
      console.log(query);
      const [result] = await db.query(query);
      const agentesMap = new Map<string, AgenteTipificado>();

      (result as any[]).forEach((item: any) => {
          const status = mapTipificacion(item.status);
          const userId = item.user;

          // Initialize the agent object if it doesn't exist
          if (!agentesMap.has(userId)) {
              agentesMap.set(userId, {
                  dni: item.user,
                  nombre: item.full_name,
                  matriculados: 0,
                  muy_interesados: 0,
                  pago_incompleto: 0,
                  volver_a_llamar: 0,
                  separacion_de_vacante: 0
              });
          }

          // Update the corresponding status count
          const agente = agentesMap.get(userId)!;
          switch (status) {
              case 'MATRICULADO':
                  agente.matriculados = item.cantidad;
                  break;
              case 'MUY INTERESADO':
                  agente.muy_interesados = item.cantidad;
                  break;
              case 'PAGO INCOMPLETO':
                  agente.pago_incompleto = item.cantidad;
                  break;
              case 'VOLVER A LLAMAR':
                  agente.volver_a_llamar = item.cantidad;
                  break;
              case 'SEPARACIÓN DE VACANTE':
                  agente.separacion_de_vacante = item.cantidad;
                  break;
              // Ignore other statuses not in AgenteTipificado
          }
      });

      // Convert map to array
      const mapeado = Array.from(agentesMap.values());
      res.json(mapeado);
    } catch (error) {
      console.error("Error al obtener logs de usuario:", error);
      res.status(500).json({ 
        error: "Error al procesar la solicitud",
        details: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : undefined
      });
    }
  }
}
