import { db } from "../../config/db";

export class UsuariosController {

    getAll = async (req: any, res: any) => {
        try {
            const [rows] = await db.query<any[]>("SELECT user, full_name FROM vicidial_users");
            res.json(rows);
        } catch (error) {
            console.error("Error al obtener usuarios:", error);
            res.status(500).json({ error: "Error al obtener usuarios" });
        }
    }
    getOne = async (req: any, res: any) => {
        try {
            const { user } = req.params;
            const [rows] = await db.query<any[]>("SELECT user, full_name FROM vicidial_users WHERE user = ?", [user]);
            res.json(rows);
        } catch (error) {
            console.error("Error al obtener usuario:", error);
            res.status(500).json({ error: "Error al obtener usuario" });
        }
    }
    getUsuariosEn = async (req: any, res: any) => {
        try {
            const { list_id, campaign_id } = req.body;
            console.log(list_id, campaign_id);
            if(!list_id && !campaign_id){
                this.getAll(req, res);
                return;
            }
            let query = `
            select vlead.user, vuser.full_name from vicidial_list AS vlead
            INNER JOIN vicidial_lists AS vlist ON vlead.list_id = vlist.list_id
            INNER JOIN vicidial_campaigns AS vcampaign ON vcampaign.campaign_id = vlist.campaign_id
            LEFT JOIN vicidial_users AS vuser ON vuser.user = vlead.user
            `;
            const queryParams: any[] = [];
            const conditions: string[] = [];
            if(list_id || campaign_id){
                query += ' WHERE ';
            }
            if(list_id){
                conditions.push('vlead.list_id = ?');
                queryParams.push(list_id);
            }
            if(campaign_id){
                conditions.push('vlist.campaign_id = ?');
                queryParams.push(campaign_id);
            }
            if (conditions.length > 0) {
                query += ` ${conditions.join(" AND ")}`;
            }
            query += ` GROUP BY vlead.user DESC;`;
            const [rows] = await db.query<any[]>(query, queryParams);
            res.json(rows);
        } catch (error) {
            console.error("Error al obtener usuario:", error);
            res.status(500).json({ error: "Error al obtener usuario" });
        }
    }
}
