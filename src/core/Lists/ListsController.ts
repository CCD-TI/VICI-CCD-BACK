import { db } from "../../config/db";

export class ListsController {
 
    getAll = async (req: any, res: any) => {
        try {
            const [rows] = await db.query<any[]>("SELECT list_id, list_name FROM vicidial_lists");
            res.json(rows);
        } catch (error) {
            console.error("Error al obtener listas:", error);
            res.status(500).json({ error: "Error al obtener listas" });
        }
    }
    getOne = async (req: any, res: any) => {
        try {
            const { list } = req.params;
            const [rows] = await db.query<any[]>("SELECT list_id, list_name FROM vicidial_lists WHERE list_id = ?", [list]);
            res.json(rows);
        } catch (error) {
            console.error("Error al obtener lista:", error);
            res.status(500).json({ error: "Error al obtener lista" });
        }
    }
    getByCampaign = async (req: any, res: any) => {
        try{
            const { campaign_id } = req.params;
            const [rows] = await db.query<any[]>("SELECT list_id, list_name FROM vicidial_lists WHERE campaign_id = ?", [campaign_id]);
            res.json(rows);
        }catch(error){
            console.error("Error al obtener listas por campaña:", error);
            res.status(500).json({ error: "Error al obtener listas por campaña" });
        }
    }
    create = async (req: any, res: any) => {
        const { list_id, list_name, campaign_id, active } = req.body;
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            
            const [rows] = await connection.query<any[]>("INSERT INTO vicidial_lists (list_id, list_name, campaign_id, active) VALUES (?, ?, ?, ?)", 
                [list_id, list_name, campaign_id, active == 'true' ? "Y" : "N"]);
            await connection.commit();
            res.json(rows);
        } catch (error) {
            await connection.rollback();
            console.error("Error al crear lista:", error);
            res.status(500).json({ error: "Error al crear lista" });
        } finally {
            connection.release();
        }
    }
}