import { db } from "../../config/db";

export class HistorialController {
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
      /*
        COD_CAMPAÑA: códigos variables de campaña por curso, (un ciodugoi)
        last_name

        DNI: dni {sin no hay dni no se colca nada}
        first_name

        NOMBRE: nombre de participante  
        address1
          
        CAMPAÑA: nombre del curso
        address3

        DEPARTAMENTO: departamento
        city

        PROFESION: profesión
        province

        TELEFONO: teléfono
        phone_number
        alt_phone

        CORREO: correo
        email

        observación:
        comments

        FECHA
        postal_code
      */
      let query = `SELECT 
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
          LEFT JOIN vicidial_campaign_statuses AS vstatus_camp 
            ON vstatus_camp.status = vlead.status AND vstatus_camp.campaign_id = vcampaign.campaign_id
          LEFT JOIN vicidial_statuses AS vstatus_sys ON vstatus_sys.status = vlead.status
          LEFT JOIN vicidial_users AS vuser ON vuser.user = vlead.user
          WHERE vlead.user = ?`;
      // Array to hold query parameters
      const queryParams: any[] = [userId];

      // Dynamically add filter conditions
      const conditions: string[] = [];

      if (estado) {
        conditions.push(`vlead.status = ?`);
        queryParams.push(`${estado}`);
      }
      if (cod_campaign) {
        conditions.push(`vlead.last_name LIKE ?`);
        queryParams.push(`%${cod_campaign}%`);
      }
      if (nombre) {
        conditions.push(`vlead.first_name LIKE ?`);
        queryParams.push(`%${dni}%`);
      }
      if (nombre_participante) {
        conditions.push(`vlead.address1 LIKE ?`);
        queryParams.push(`%${nombre_participante}%`);
      }
      if (nombre_curso) {
        conditions.push(`vlead.address3 LIKE ?`);
        queryParams.push(`%${nombre_curso}%`);
      }
      if (departamento) {
        conditions.push(`vlead.city LIKE ?`);
        queryParams.push(`%${departamento}%`);
      }
      if(profesion) {
        conditions.push(`vlead.province LIKE ?`);
        queryParams.push(`%${profesion}%`);
      }
      
      if (phone_number) {
        conditions.push(`vlead.phone_number LIKE ?`);
        queryParams.push(`%${phone_number}%`);
      }
      
      if (email) {
        conditions.push(`vlead.email LIKE ?`);
        queryParams.push(`%${email}%`);
      }
      
      if (comments) {
        conditions.push(`vlead.comments LIKE ?`);
        queryParams.push(`%${comments}%`);
      }

      /*
      if (fecha) {
        
        conditions.push(`DATE(vlead.modify_date) = ?`);
        queryParams.push(fecha);
      }
*/
      // Append conditions to query if any exist
      if (conditions.length > 0) {
        query += ` AND ${conditions.join(" AND ")}`;
      }

      // Add pagination
      query += ` ORDER BY status_code DESC LIMIT ? OFFSET ?`;
      queryParams.push(limit, offset);
      const [rows] = await db.query(query, queryParams);

      res.json({
        page,
        limit,
        results: rows,
      });
    } catch (error) {
      console.error("Error al obtener leads:", error);
      res.status(500).json({ error: "Error al obtener leads" });
    }
  };
  getResumenByUser = async (req: any, res: any) => {
    const { userId } = req.params;
    try {
      const [rows] = await db.query<any[]>(
        `SELECT status, COUNT(*) AS cantidad
            FROM vicidial_list
            WHERE user = ?
            GROUP BY status
            ORDER BY cantidad DESC;`,
        [userId]
      );
      const resumen = rows.map((res: any) => ({
        id: res.status,
        cantidad: res.cantidad,
        ...this.significado(res.status),
      }));
      res.json(resumen);
    } catch (error) {
      console.error("Error al obtener leads:", error);
      res.status(500).json({ error: "Error al obtener leads" });
    }
  };
  private significado = (id: string): { icon: string; statusname: string } => {
    /*
      1101	MATRICULADO
1102	PAGO INCOMPLETO
1202	MUY INTERESADO
1203	SEPARACIÓN DE VACANTE 
1301	PRECIO FUERA PRESUPUESTO
1302	NO DESEA POR HORARIO
1303	PARA PRÓXIMO INICIO
1304	NO PIDIÓ INFO
1305	DESEA OTRA ESPECIALIDAD
1313	NO DESEA, NO DA MOTIVOS
1316	PIDE NO CONTACTAR
1318	CUELGA ANTES INFO
2203	NÚMERO NO PERTENECE
4101	NO CONTESTA
4102	CASILLA DE VOZ 
4201	NÚMERO FUERA DE SERVICIO
      */
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

  repeticiones = async (req : any, res: any) => {
    const { phone_number, userId } = req.query;
    try {
      const [rows] = await db.query<any[]>(
        `SELECT vlead.comments, vlead.modify_date
        FROM vicidial_list as vlead
        WHERE vlead.phone_number = ? AND vlead.user = ?
        GROUP BY vlead.modify_date;`,
        [phone_number, userId]
      );
      res.json(rows);
    } catch (error) {
      console.error("Error al obtener leads:", error);
      res.status(500).json({ error: "Error al obtener leads" });
    }
  } 
  
  repeticionesglobal = async (req: any, res: any) => {
  try {
    // Leer parámetros de paginación
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Consulta principal con paginación
    const [rows] = await db.query<any[]>(`
      SELECT 
        phone_number,
        first_name,
        last_name,
        comments,
        modify_date
      FROM vicidial_list
      WHERE phone_number IN (
        SELECT phone_number
        FROM vicidial_list
        GROUP BY phone_number
        HAVING COUNT(*) > 1
      )
      ORDER BY phone_number, modify_date DESC
      LIMIT ? OFFSET ?;
    `, [limit, offset]);

    // Consulta para obtener el total de registros (sin paginar)
    const [countResult] = await db.query<any[]>(`
      SELECT COUNT(*) AS total
      FROM vicidial_list
      WHERE phone_number IN (
        SELECT phone_number
        FROM vicidial_list
        GROUP BY phone_number
        HAVING COUNT(*) > 1
      );
    `);

    const total = countResult[0]?.total || 0;

    res.json({
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      items: rows,
    });
  } catch (error) {
    console.error("Error al obtener repeticiones:", error);
    res.status(500).json({ error: "Error al obtener repeticiones" });
  }
};



  deleteById = async (req: any, res: any) => {
    const { leadId } = req.params;

    try {
      const [rows] = await db.query(
        `SELECT * FROM vicidial_list WHERE lead_id = ?`,
        [leadId]
      );

      if (Array.isArray(rows) && rows.length === 0) {
        return res.status(404).json({ message: "Registro no encontrado" });
      }

      const [result] = await db.query(
        `DELETE FROM vicidial_list WHERE lead_id = ?`,
        [leadId]
      );

      if ((result as any).affectedRows === 0) {
        return res.status(404).json({ message: "No se pudo eliminar el registro" });
      }

      res.json({ message: "Registro eliminado correctamente" });
    } catch (error) {
      console.error("Error al eliminar el registro:", error);
      res.status(500).json({ error: "Error interno al eliminar el registro" });
    }
  };

}
