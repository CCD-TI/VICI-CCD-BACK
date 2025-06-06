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
            query += ' AND v.event_time LIKE ?';
            params.push(`%${date}%`);
        }

        if (start_date) {
            query += ' AND v.event_time >= ?';
            params.push(start_date);
        }
        if (end_date) {
            query += ' AND v.event_time <= ?';
            params.push(end_date);
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
        const { user, start_date, end_date, sub_status } = req.query;

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
}

export default new DeadTimeController();