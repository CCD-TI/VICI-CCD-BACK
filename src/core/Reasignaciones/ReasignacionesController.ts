import { dbmalcriada } from "../../config/dbmalcriada";

export class ReasignacionesController{
    getAll = async (req: any, res: any) => {
        try {
            const [rows] = await dbmalcriada.query(`SELECT * FROM vicidial_reasignaciones`);   
            res.json(rows);
        } catch (error) {
            console.error("Error al obtener reasignaciones:", error);
            res.status(500).json({ error: "Error al obtener reasignaciones" });
        }
    }
    getOne = async (req: any, res: any) => {
        try {
            const { id } = req.params;
            const [rows] = await dbmalcriada.query(`SELECT * FROM vicidial_reasignaciones WHERE reasignaciones_id = ?`, [id]);   
            res.json((rows as any)[0]);
        } catch (error) {
            console.error("Error al obtener reasignaciones:", error);
            res.status(500).json({ error: "Error al obtener reasignaciones" });
        }
    }
    getContent = async (req: any, res: any) => {
        try {
            const { id } = req.params;
            const [rows] = await dbmalcriada.query(`SELECT * FROM vicidial_reasignacion WHERE reasignaciones_id = ?`, [id]);   
            res.json(rows);
        } catch (error) {
            console.error("Error al obtener reasignaciones:", error);
            res.status(500).json({ error: "Error al obtener reasignaciones" });
        }
    }
}