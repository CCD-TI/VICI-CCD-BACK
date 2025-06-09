import { db } from "../../config/db";
import { Request, Response } from 'express';

export class TiempollamadaController {
  getAllByUser2 = async (req: any, res: any) => {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ message: "Missing userId parameter." });
    }
    try {
      const query = `
        SELECT 
          vl.call_date, 
          vl.phone_number, 
          vl.status, 
          vl.length_in_sec, 
          vl.term_reason, 
          vl.campaign_id
        FROM asterisk.vicidial_log vl
        WHERE vl.user = ? 
          AND vl.call_date LIKE ?
        ORDER BY vl.call_date DESC
      `;
      const [results] = await db.query(query, [userId, `%2025-06-06%`]) as any[];
      
      // Definir el tipo para los datos agrupados
      interface GroupedStatus {
        status: string;
        status_name: string;
        cantidad: number;
        segundos: number;
      }
      
      // Agrupar los datos por status
      const groupedData: { [key: string]: GroupedStatus } = {};
      
      results.forEach((row: any) => {
        const status = row.status;
        const lengthInSec = parseInt(row.length_in_sec) || 0;
        
        if (groupedData[status]) {
          // Si ya existe el status, sumar los segundos y incrementar cantidad
          groupedData[status].cantidad += 1;
          groupedData[status].segundos += lengthInSec;
        } else {
          // Si es la primera vez que aparece el status
          groupedData[status] = {
            status: status,
            status_name: '', // Lo llenaremos después
            cantidad: 1,
            segundos: lengthInSec
          };
        }
      });
      
      // Obtener los nombres de los status
      const statusCodes = Object.keys(groupedData);
      
      for (const statusCode of statusCodes) {
        try {
          const statusQuery = `
            SELECT status_name 
            FROM asterisk.vicidial_campaign_statuses 
            WHERE status = ? 
            LIMIT 1
          `;
          const [statusResult] = await db.query(statusQuery, [statusCode]) as any[];
          
          if (statusResult && statusResult.length > 0) {
            groupedData[statusCode].status_name = statusResult[0].status_name;
          } else {
            groupedData[statusCode].status_name = 'Unknown Status';
          }
        } catch (error) {
          console.error(`Error getting status name for ${statusCode}:`, error);
          groupedData[statusCode].status_name = 'Error getting name';
        }
      }
      
      // Convertir el objeto en un array
      const finalResult = Object.values(groupedData);
      
      return res.json(finalResult);
    } catch (error) {
      console.error("DB query error:", error);
      return res.status(500).json({ message: "Database error", error });
    }
  };

  private getStatusName = (id: string) => {
    switch (id) {
      case "1101":
        return { icon: "pi", statusname: "MATRICULADO" };
      case "1102":
        return { icon: "pi", statusname: "PAGO INCOMPLETO" };
      case "1202":
        return { icon: "pi", statusname: "MUY INTERESADO" };
      case "1203":
        return { icon: "pi", statusname: "SEPARACIÓN DE VACANTE" };
      case "1301":
        return { icon: "pi", statusname: "PRECIO FUERA PRESUPUESTO" };
      case "1302":
        return { icon: "pi", statusname: "NO DESEA POR HORARIO" };
      case "1303":
        return { icon: "pi", statusname: "PARA PRÓXIMO INICIO" };
      case "1304":
        return { icon: "pi", statusname: "NO PIDIÓ INFO" };
      case "1305":
        return { icon: "pi", statusname: "DESEA OTRA ESPECIALIDAD" };
      case "1313":
        return { icon: "pi", statusname: "NO DESEA, NO DA MOTIVOS" };
      case "1316":
        return { icon: "pi", statusname: "PIDE NO CONTACTAR" };
      case "1318":
        return { icon: "pi", statusname: "CUELGA ANTES INFO" };
      case "2203":
        return { icon: "pi", statusname: "NÚMERO NO PERTENECE" };
      case "4101":
        return { icon: "pi", statusname: "NO CONTESTA" };
      case "4102":
        return { icon: "pi", statusname: "CASILLA DE VOZ" };
      case "4201":
        return { icon: "pi", statusname: "NÚMERO FUERA DE SERVICIO" };
      default:
        return { icon: "pi", statusname: "DESCONOCIDO" };
    }
  };

  getAllByUser = async (req: any, res: any) => {
    try {
      const { desde, hasta } = req.query;

      const today = new Date();
      const endDate = hasta ? new Date(hasta) : today;
      const startDate = desde
        ? new Date(desde)
        : new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000);

      const formatDate = (date: Date) => {
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
      };

      const formattedStart = formatDate(startDate);
      const formattedEnd = formatDate(endDate);

      const query = `
        SELECT vl.call_date, vl.phone_number, vl.status, vl.length_in_sec, vl.term_reason, vl.campaign_id, vu.full_name
        FROM asterisk.vicidial_log vl inner join vicidial_users vu on vl.user = vu.user
        WHERE vl.call_date BETWEEN ? AND ?
          AND vl.user <> 'VDAD'
        ORDER BY vl.call_date DESC
      `;

      const [results] = await db.query(query, [`${formattedStart} 00:00:00`, `${formattedEnd} 23:59:59`]) as any[];

      interface GroupedStatus {
        status: string;
        status_name: string;
        cantidad: number;
        segundos: number;
      }

      interface DailyStatusSummary {
        statuses: GroupedStatus[];
        total_cantidad: number;
        total_segundos: number;
      }

      interface UserData {
        user: string;
        status_details: GroupedStatus[];
        status_by_day: { [date: string]: DailyStatusSummary };
        total_status: number;
        total_segundos: number;
      }

      const userGroups: { [key: string]: any[] } = {};
      results.forEach((row: any) => {
        const userId = row.full_name;
        if (!userGroups[userId]) {
          userGroups[userId] = [];
        }
        userGroups[userId].push(row);
      });

      const usersData: UserData[] = [];
      let totalGeneralStatus = 0;
      let totalGeneralSegundos = 0;
      const globalStatusSummary: { [key: string]: GroupedStatus } = {};

      for (const [userId, userRows] of Object.entries(userGroups)) {
        const statusGroups: { [key: string]: GroupedStatus } = {};
        const dailyGroups: { [date: string]: { [status: string]: GroupedStatus } } = {};

        userRows.forEach((row: any) => {
          const status = row.status;
          const lengthInSec = parseInt(row.length_in_sec) || 0;
          const callDate = formatDate(new Date(row.call_date)); // Extraer solo fecha

          // Agrupación global por usuario
          if (statusGroups[status]) {
            statusGroups[status].cantidad += 1;
            statusGroups[status].segundos += lengthInSec;
          } else {
            const statusInfo = this.getStatusName(status);
            statusGroups[status] = {
              status: status,
              status_name: statusInfo.statusname,
              cantidad: 1,
              segundos: lengthInSec,
            };
          }

          // Agrupación global general
          if (globalStatusSummary[status]) {
            globalStatusSummary[status].cantidad += 1;
            globalStatusSummary[status].segundos += lengthInSec;
          } else {
            const statusInfo = this.getStatusName(status);
            globalStatusSummary[status] = {
              status: status,
              status_name: statusInfo.statusname,
              cantidad: 1,
              segundos: lengthInSec,
            };
          }

          // Agrupar por día y status para el usuario
          if (!dailyGroups[callDate]) {
            dailyGroups[callDate] = {};
          }
          if (dailyGroups[callDate][status]) {
            dailyGroups[callDate][status].cantidad += 1;
            dailyGroups[callDate][status].segundos += lengthInSec;
          } else {
            const statusInfo = this.getStatusName(status);
            dailyGroups[callDate][status] = {
              status: status,
              status_name: statusInfo.statusname,
              cantidad: 1,
              segundos: lengthInSec,
            };
          }
        });

        // Convertir statusGroups a array
        const statusArray = Object.values(statusGroups);
        const userTotalStatus = statusArray.reduce((sum, item) => sum + item.cantidad, 0);
        const userTotalSegundos = statusArray.reduce((sum, item) => sum + item.segundos, 0);

        totalGeneralStatus += userTotalStatus;
        totalGeneralSegundos += userTotalSegundos;

        // Construir el objeto status_by_day con totales
        const status_by_day: { [date: string]: DailyStatusSummary } = {};
        for (const [date, statusesObj] of Object.entries(dailyGroups)) {
          const statusList = Object.values(statusesObj);
          const total_cantidad = statusList.reduce((sum, s) => sum + s.cantidad, 0);
          const total_segundos = statusList.reduce((sum, s) => sum + s.segundos, 0);

          status_by_day[date] = {
            statuses: statusList,
            total_cantidad,
            total_segundos,
          };
        }

        usersData.push({
          user: userId,
          status_details: statusArray,
          status_by_day,
          total_status: userTotalStatus,
          total_segundos: userTotalSegundos,
        });
      }

      usersData.sort((a, b) => b.total_status - a.total_status);

      const globalStatusArray = Object.values(globalStatusSummary);
      globalStatusArray.sort((a, b) => b.cantidad - a.cantidad);

      const response = {
        rango: {
          desde: formattedStart,
          hasta: formattedEnd,
        },
        users: usersData,
        totals: {
          total_usuarios: usersData.length,
          total_status_general: totalGeneralStatus,
          total_segundos_general: totalGeneralSegundos,
        },
        global_status_summary: globalStatusArray,
      };

      return res.json(response);
    } catch (error) {
      console.error("DB query error:", error);
      return res.status(500).json({ message: "Database error", error });
    }
  };

  getByDate = async (req: Request, res: Response): Promise<void> => {
    const { user, start_date, end_date, called_number } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    try {
      let baseQuery = `
        FROM asterisk.recording_log rl
        LEFT JOIN asterisk.vicidial_list vl ON rl.lead_id = vl.lead_id
      `;
      const conditions: string[] = [];
      const params: any[] = [];

      if (user) {
        conditions.push('rl.user = ?');
        params.push(user);
      }

      if (start_date && end_date) {
        conditions.push('DATE(rl.start_time) BETWEEN ? AND ?');
        params.push(start_date, end_date);
      } else if (start_date) {
        conditions.push('DATE(rl.start_time) >= ?');
        params.push(start_date);
      } else if (end_date) {
        conditions.push('DATE(rl.start_time) <= ?');
        params.push(end_date);
      }

      if (called_number) {
        conditions.push('vl.phone_number LIKE ?');
        params.push(`%${called_number}%`);
      }

      const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

      console.log("Query Parameters:", { user, start_date, end_date, called_number });
      console.log("SQL Query Parameters:", params);

      const [countRows] = await db.query<any[]>(`SELECT COUNT(*) as total ${baseQuery} ${whereClause}`, params);
      const total = countRows[0]?.total || 0;

      const [rows] = await db.query<any[]>(`
        SELECT 
          rl.recording_id,
          rl.start_time,
          rl.end_time,
          rl.location,
          rl.lead_id,
          rl.user,
          vl.phone_number AS called_number
        ${baseQuery}
        ${whereClause}
        ORDER BY rl.start_time DESC
        LIMIT ? OFFSET ?
      `, [...params, limit, offset]);

      const updatedRows = rows.map(row => ({
        ...row,
        location: row.location
          ? row.location.replace('https://192.168.1.210/', 'https://vicidial.grupowya.com/')
          : null
      }));

      res.json({
        llamadas: updatedRows,
        currentPage: page,
        totalItems: total,
        totalPages: Math.ceil(total / limit)
      });
    } catch (error) {
      console.error('Error al obtener grabaciones:', error);
      res.status(500).json({ error: 'Error al obtener grabaciones' });
    }
  };

}