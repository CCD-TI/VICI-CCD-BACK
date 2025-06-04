import { db } from "../../config/db";

export class HistorialusersController {
  getAllByUser = async (req: any, res: any) => {
    const { userId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const {
        estado,
        cod_campaign,
        dni,
        nombre_participante,
        nombre_curso,
        departamento,
        profesion,
        phone_number,
        email,
        campaign,
        nombre,
        comments,
        fecha,
    } = req.query;

    try {
        let query = `
        SELECT 
            vlead.last_name,
            vlead.first_name,
            vlead.address1,
            vlead.address3,
            vlead.city,
            vlead.province,
            vlead.phone_number,
            vlead.email,
            vlead.comments,
            vlead.postal_code,
            vlead.status AS status_code,
            COALESCE(vstatus_camp.status_name, vstatus_sys.status_name, vlead.status) AS status_display,
            vuser.full_name,
            vlead.user,
            vcampaign.campaign_name,
            vlead.modify_date
        FROM vicidial_list AS vlead
        INNER JOIN vicidial_lists AS vlist ON vlead.list_id = vlist.list_id
        INNER JOIN vicidial_campaigns AS vcampaign ON vcampaign.campaign_id = vlist.campaign_id
        LEFT JOIN vicidial_campaign_statuses AS vstatus_camp ON vstatus_camp.status = vlead.status AND vstatus_camp.campaign_id = vcampaign.campaign_id
        LEFT JOIN vicidial_statuses AS vstatus_sys ON vstatus_sys.status = vlead.status
        LEFT JOIN vicidial_users AS vuser ON vuser.user = vlead.user
        WHERE vlead.user = ?
        `;

        const params: any[] = [userId];
        const filters: string[] = [];

        if (estado) filters.push("vlead.status = ?"), params.push(estado);
        if (cod_campaign) filters.push("vlead.last_name LIKE ?"), params.push(`%${cod_campaign}%`);
        if (nombre) filters.push("vlead.first_name LIKE ?"), params.push(`%${nombre}%`);
        if (nombre_participante) filters.push("vlead.address1 LIKE ?"), params.push(`%${nombre_participante}%`);
        if (nombre_curso) filters.push("vlead.address3 LIKE ?"), params.push(`%${nombre_curso}%`);
        if (departamento) filters.push("vlead.city LIKE ?"), params.push(`%${departamento}%`);
        if (profesion) filters.push("vlead.province LIKE ?"), params.push(`%${profesion}%`);
        if (phone_number) filters.push("vlead.phone_number LIKE ?"), params.push(`%${phone_number}%`);
        if (email) filters.push("vlead.email LIKE ?"), params.push(`%${email}%`);
        if (comments) filters.push("vlead.comments LIKE ?"), params.push(`%${comments}%`);
        // Puedes reactivar la fecha si haces parseo correcto
        // if (fecha) filters.push("DATE(vlead.modify_date) = ?"), params.push(fecha);

        if (filters.length) query += ` AND ${filters.join(" AND ")}`;

        query += ` ORDER BY status_code DESC LIMIT ? OFFSET ?`;
        params.push(limit, offset);

        const [rows] = await db.query(query, params);
        res.json({ page, limit, results: rows });
    } catch (error) {
        console.error("Error al obtener leads:", error);
        res.status(500).json({ error: "Error al obtener leads" });
    }
  };
}