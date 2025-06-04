import { Request, Response } from 'express';
import { db } from '../db';

export const getGestion = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const offset = (page - 1) * limit;

  try {
    const [rows] = await db.query(
      `SELECT 
        vcampaign.campaign_name, 
        vlead.status AS status_code,
        COALESCE(vstatus_camp.status_name, vstatus_sys.status_name, vlead.status) AS status_display,
        vuser.full_name,
        vlead.user, 
        vlead.phone_number, 
        vlead.first_name,
        vlead.comments, 
        vlead.modify_date
      FROM vicidial_list AS vlead
      INNER JOIN vicidial_lists AS vlist ON vlead.list_id = vlist.list_id
      INNER JOIN vicidial_campaigns AS vcampaign ON vcampaign.campaign_id = vlist.campaign_id
      LEFT JOIN vicidial_campaign_statuses AS vstatus_camp 
        ON vstatus_camp.status = vlead.status AND vstatus_camp.campaign_id = vcampaign.campaign_id
      LEFT JOIN vicidial_statuses AS vstatus_sys ON vstatus_sys.status = vlead.status
      LEFT JOIN vicidial_users AS vuser ON vuser.user = vlead.user
      WHERE vlead.user = ?
      ORDER BY status_code DESC
      LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );

    res.json({
      page,
      limit,
      results: rows,
    });
  } catch (error) {
    console.error('Error al obtener leads:', error);
    res.status(500).json({ error: 'Error al obtener leads' });
  }
};
