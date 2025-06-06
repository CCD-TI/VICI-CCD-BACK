import { Temporal } from 'temporal-polyfill';
import { db } from '../../config/db';

export class DeadTimeController {
    getTiempoTotal = async (req: any, res: any) => {
        const { user, start_date, end_date, date } = req.query;

        let query = `
          SELECT 
            v.user,
            u.full_name,
            SUM(v.pause_sec) AS total_pause_time_seconds,
            SUM(v.wait_sec + v.dead_sec) AS total_dead_time_seconds
          FROM vicidial_agent_log v
          JOIN vicidial_users u ON v.user = u.user
          WHERE 1 = 1
        `;
        const params = [];

        if (user) {
            query += ' AND v.user = ?';
            params.push(user);
        }

        if (date) {
            query += ' AND DATE(v.event_time) = ?';
            params.push(date);
        }

        if (start_date && end_date) {
            query += ' AND v.event_time BETWEEN ? AND ?';
            params.push(start_date, end_date);
        }

        query += ' GROUP BY v.user, u.full_name';

        try {
            const [rows] = await db.query(query, params);
            res.json(rows);
        } catch (error) {
            res.status(500).json({ error: error });
        }
    };

    getTiemposPorTipo = async (req: any, res: any) => {
        const { user, start_date, end_date, sub_status, date } = req.query;

        let query = `
          SELECT 
            v.user,
            u.full_name,
            v.sub_status,
            SUM(v.pause_sec) AS total_pause_time_seconds,
            SUM(v.wait_sec + v.dead_sec) AS total_dead_time_seconds
          FROM vicidial_agent_log v
          JOIN vicidial_users u ON v.user = u.user
          WHERE v.sub_status IS NOT NULL
        `;
        const params = [];

        if (user) {
            query += ' AND v.user = ?';
            params.push(user);
        }
        if (sub_status) {
            query += ' AND v.sub_status = ?';
            params.push(sub_status);
        }

        if (date) {
            query += ' AND DATE(v.event_time) = ?';
            params.push(date);
        }

        if (start_date && end_date) {
            query += ' AND v.event_time BETWEEN ? AND ?';
            params.push(start_date, end_date);
        }

        if (start_date) {
            query += ' AND v.event_time >= ?';
            params.push(start_date);
        }
        if (end_date) {
            query += ' AND v.event_time <= ?';
            params.push(end_date);
        }

        query += ' GROUP BY v.user, u.full_name, v.sub_status ORDER BY v.user, v.sub_status';

        try {
            const [rows] = await db.query(query, params);
            res.json(rows);
        } catch (error) {
            res.status(500).json({ error: error });
        }
    };

    getTiemposPorTipoFecha = async (req: any, res: any) => {
        const { user, start_date, end_date, sub_status } = req.query;

        let query = `
            SELECT 
                v.user,
                u.full_name,
                DATE(v.event_time) AS fecha,
                v.sub_status,
                SUM(v.pause_sec) AS total_pausa,
                SUM(v.wait_sec + v.dead_sec) AS total_tiempo_muerto
            FROM vicidial_agent_log v
            JOIN vicidial_users u ON v.user = u.user
            WHERE v.sub_status IS NOT NULL
        `;
        const params = [];

        if (user) {
            query += ' AND v.user = ?';
            params.push(user);
        }

        if (sub_status) {
            query += ' AND v.sub_status = ?';
            params.push(sub_status);
        }

        if (start_date && end_date) {
            query += ' AND v.event_time BETWEEN ? AND ?';
            params.push(start_date, end_date);
        } else if (start_date) {
            query += ' AND v.event_time >= ?';
            params.push(start_date);
        } else if (end_date) {
            query += ' AND v.event_time <= ?';
            params.push(end_date);
        }

        query += `
            GROUP BY v.user, u.full_name, fecha, v.sub_status
            ORDER BY v.user, fecha, v.sub_status
        `;

        try {
            const [rows] = await db.query(query, params);

            // 🔁 Reestructurar los resultados
            const resultado = [];

            for (const row of rows as any[]) {
                const { user, full_name, fecha, sub_status, total_pausa, total_tiempo_muerto } = row;

                // Buscar usuario existente
                let usuario: any = resultado.find((u: any) => u.user === user);
                if (!usuario) {
                    usuario = { user, full_name, PausasFecha: [] };
                    resultado.push(usuario);
                }

                // Convertir fecha a YYYY-MM-DD si es necesario
                const fechaStr = new Date(fecha).toISOString().split("T")[0];

                // Buscar fecha existente
                let dia: any = usuario.PausasFecha.find((f: any) => f.fecha === fechaStr);
                if (!dia) {
                    dia = { fecha: fechaStr, tipificaciones: [] };
                    usuario.PausasFecha.push(dia);
                }

                // Agregar tipificación a la fecha correspondiente
                dia.tipificaciones.push({
                    nombre: sub_status,
                    totalPausa: total_pausa,
                    totalTiempoMuerto: total_tiempo_muerto
                });
            }

            res.json(resultado);
        } catch (error) {
            res.status(500).json({ error: error });
        }
    };


}

export default new DeadTimeController();