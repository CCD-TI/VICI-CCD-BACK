import { db } from "../../config/db";
import { mapTipificacion } from "../../Utils/utils";

export class ReporteController {
  TipificacionesPorDia = async (req: any, res: any) => {
    try {
      const { fechaInicio, fechaFin } = req.query;
      const [rows] = await db.query<any[]>(
        `SELECT DATE(modify_date) AS fecha, status, COUNT(*) AS cantidad
        FROM vicidial_list
        WHERE status IN ('1101', '1102', '1202', '1201', '1203', '1301')
        AND modify_date BETWEEN ? AND ?
        GROUP BY fecha, status
        ORDER BY fecha;`,
        [fechaInicio, fechaFin]
      );

      // Agrupar los datos por status
      const groupedData: { [key: string]: { value: number; name: string }[] } =
        {};

      rows.forEach((row: any) => {
        const status = row.status;
        const fecha = new Date(row.fecha).toISOString().split('T')[0];// Convertir a formato ISO
        const cantidad = row.cantidad;

        if (!groupedData[status]) {
          groupedData[status] = [];
        }
        groupedData[status].push({
          value: cantidad,
          name: fecha,
        });
      });

      // Transformar a la estructura final
      const result = Object.keys(groupedData).map((status) => ({
        name: mapTipificacion(status), // Usa el nombre descriptivo o el código
        series: groupedData[status],
      }));

      console.log(result);
      res.json(result);
    } catch (error) {
      console.error("Error al obtener leads:", error);
      res.status(500).json({ error: "Error al obtener leads" });
    }
  };
  TiemposdeActividadeInactividadPromedio = async (req: any, res: any) => {
    try {
      let query = `
      SELECT 
          AVG(tiempo_actividad) AS promedio_actividad,
          AVG(tiempo_inactividad) AS promedio_inactividad
      FROM (
          SELECT 
              user,
              SUM(talk_sec + dispo_sec) AS tiempo_actividad,
              SUM(wait_sec + pause_sec) AS tiempo_inactividad
          FROM 
              vicidial_agent_log
          WHERE 
              event_time >= CURDATE()
          GROUP BY 
              user
      ) AS resumen_por_agente;
      `
      const [rows] = await db.query<any[]>(query);
      res.json(rows);
    } catch (error) {
      console.error("Error al obtener tiempos de actividad:", error);
      res.status(500).json({ error: "Error al obtener tiempos de actividad" });
    }
  }
  
}
