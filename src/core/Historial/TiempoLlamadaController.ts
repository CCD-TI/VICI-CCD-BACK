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
      const [results] = await db.query(query, [userId, `%2025-06-05%`]) as any[];
      
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
      const query = `
        SELECT vl.call_date, vl.phone_number, vl.status, vl.length_in_sec, vl.term_reason, vl.campaign_id, vl.user
        FROM asterisk.vicidial_log vl
        WHERE vl.call_date LIKE '%2025-06-05%'
          AND vl.user <> 'VDAD'
        ORDER BY vl.call_date DESC
      `;
      
      const [results] = await db.query(query) as any[];
      
      // Definir tipos
      interface GroupedStatus {
        status: string;
        status_name: string;
        cantidad: number;
        segundos: number;
      }
      
      interface UserData {
        user: string;
        status_details: GroupedStatus[];
        total_status: number;
        total_segundos: number;
      }
      
      // Agrupar por usuario
      const userGroups: { [key: string]: any[] } = {};
      
      results.forEach((row: any) => {
        const userId = row.user;
        if (!userGroups[userId]) {
          userGroups[userId] = [];
        }
        userGroups[userId].push(row);
      });
      
      // Procesar cada usuario
      const usersData: UserData[] = [];
      let totalGeneralStatus = 0;
      let totalGeneralSegundos = 0;
      
      // Para el resumen global de status
      const globalStatusSummary: { [key: string]: GroupedStatus } = {};
      
      for (const [userId, userRows] of Object.entries(userGroups)) {
        // Agrupar por status para este usuario
        const statusGroups: { [key: string]: GroupedStatus } = {};
        
        userRows.forEach((row: any) => {
          const status = row.status;
          const lengthInSec = parseInt(row.length_in_sec) || 0;
          
          if (statusGroups[status]) {
            statusGroups[status].cantidad += 1;
            statusGroups[status].segundos += lengthInSec;
          } else {
            const statusInfo = this.getStatusName(status);
            statusGroups[status] = {
              status: status,
              status_name: statusInfo.statusname,
              cantidad: 1,
              segundos: lengthInSec
            };
          }
          
          // Agregar al resumen global
          if (globalStatusSummary[status]) {
            globalStatusSummary[status].cantidad += 1;
            globalStatusSummary[status].segundos += lengthInSec;
          } else {
            const statusInfo = this.getStatusName(status);
            globalStatusSummary[status] = {
              status: status,
              status_name: statusInfo.statusname,
              cantidad: 1,
              segundos: lengthInSec
            };
          }
        });
        
        // Calcular totales por usuario
        const statusArray = Object.values(statusGroups);
        const userTotalStatus = statusArray.reduce((sum, item) => sum + item.cantidad, 0);
        const userTotalSegundos = statusArray.reduce((sum, item) => sum + item.segundos, 0);
        
        // Agregar a totales generales
        totalGeneralStatus += userTotalStatus;
        totalGeneralSegundos += userTotalSegundos;
        
        usersData.push({
          user: userId,
          status_details: statusArray,
          total_status: userTotalStatus,
          total_segundos: userTotalSegundos
        });
      }
      
      // Ordenar usuarios por total de status (mayor a menor)
      usersData.sort((a, b) => b.total_status - a.total_status);
      
      // Convertir el resumen global a array y ordenar por cantidad
      const globalStatusArray = Object.values(globalStatusSummary);
      globalStatusArray.sort((a, b) => b.cantidad - a.cantidad);
      
      const response = {
        users: usersData,
        totals: {
          total_usuarios: usersData.length,
          total_status_general: totalGeneralStatus,
          total_segundos_general: totalGeneralSegundos
        },
        global_status_summary: globalStatusArray
      };
      
      return res.json(response);
    } catch (error) {
      console.error("DB query error:", error);
      return res.status(500).json({ message: "Database error", error });
    }
  };

  getByDate = async (req: Request, res: Response): Promise<void> => {
    const { user, date } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    try {
      let baseQuery = `
        FROM asterisk.recording_log rl
      `;
      const conditions: string[] = [];
      const params: any[] = [];

      if (user) {
        conditions.push('rl.user = ?');
        params.push(user);
      }

      if (date) {
        conditions.push('DATE(rl.start_time) = ?');
        params.push(date);
      }

      const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

      // Query total count
      const [countRows] = await db.query<any[]>(
        `SELECT COUNT(*) as total ${baseQuery} ${whereClause}`,
        params
      );
      const total = countRows[0]?.total || 0;

      // Main data query
      const [rows] = await db.query<any[]>(
        `
        SELECT 
          rl.recording_id,
          rl.start_time,
          rl.end_time,
          rl.location,
          rl.lead_id,
          rl.user
        ${baseQuery}
        ${whereClause}
        ORDER BY rl.start_time DESC
        LIMIT ? OFFSET ?
        `,
        [...params, limit, offset]
      );

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