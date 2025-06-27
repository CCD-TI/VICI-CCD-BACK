import { db } from "../../config/db";
import { dbmalcriada } from "../../config/dbmalcriada";
import { tipificacionesMap } from "../../Utils/utils";

export class HistorialController {
  getAllByUser = async (req: any, res: any) => {
    const {
      page,
      limit,
      estado,
      cod_campaign,
      usuario,
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
      list_id,
      campaign_id,
      statuses,
      agentes,
      datedesde,
      datehasta,
      entry_date,
      modify_date,
    } = req.body;
    const offset = (page - 1) * limit;
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
        vlist.list_id,
        vlead.lead_id,
        vcampaign.campaign_name,
        vlist.list_name,
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
        vlead.entry_date,
        vlead.modify_date
      FROM vicidial_list AS vlead
      INNER JOIN vicidial_lists AS vlist ON vlead.list_id = vlist.list_id
      INNER JOIN vicidial_campaigns AS vcampaign ON vcampaign.campaign_id = vlist.campaign_id
      LEFT JOIN vicidial_campaign_statuses AS vstatus_camp 
        ON vstatus_camp.status = vlead.status AND vstatus_camp.campaign_id = vcampaign.campaign_id
      LEFT JOIN vicidial_statuses AS vstatus_sys ON vstatus_sys.status = vlead.status
      LEFT JOIN vicidial_users AS vuser ON vuser.user = vlead.user
      `;
      // Count query to get total records
      let countQuery = `SELECT COUNT(*) as total
      FROM vicidial_list AS vlead
      INNER JOIN vicidial_lists AS vlist ON vlead.list_id = vlist.list_id
      INNER JOIN vicidial_campaigns AS vcampaign ON vcampaign.campaign_id = vlist.campaign_id
      LEFT JOIN vicidial_campaign_statuses AS vstatus_camp 
        ON vstatus_camp.status = vlead.status AND vstatus_camp.campaign_id = vcampaign.campaign_id
      LEFT JOIN vicidial_statuses AS vstatus_sys ON vstatus_sys.status = vlead.status
      LEFT JOIN vicidial_users AS vuser ON vuser.user = vlead.user
      `;
      // Array to hold query parameters
      const queryParams: any[] = [];
      const countParams: any[] = [];
      if (
        usuario ||
        estado ||
        cod_campaign ||
        nombre ||
        nombre_participante ||
        nombre_curso ||
        departamento ||
        profesion ||
        phone_number ||
        email ||
        campaign ||
        campaign_id ||
        nombre ||
        comments ||
        fecha ||
        list_id ||
        campaign_id ||
        statuses ||
        agentes ||
        datedesde ||
        datehasta ||
        entry_date ||
        modify_date
      ) {
        query += " WHERE ";
        countQuery += " WHERE ";
      }
      // Dynamically add filter conditions
      const conditions: string[] = [];
      if (usuario) {
        conditions.push(`vlead.user = ?`);
        queryParams.push(`${usuario}`);
        countParams.push(`${usuario}`);
      }
      if (estado) {
        conditions.push(`vlead.status = ?`);
        queryParams.push(`${estado}`);
        countParams.push(`${estado}`);
      }
      if (cod_campaign) {
        conditions.push(`vlead.last_name LIKE ?`);
        queryParams.push(`%${cod_campaign}%`);
        countParams.push(`%${cod_campaign}%`);
      }
      if (list_id) {
        conditions.push(`vlead.list_id = ?`);
        queryParams.push(`${list_id}`);
        countParams.push(`${list_id}`);
      }
      if (campaign_id) {
        conditions.push(`vlist.campaign_id = ?`);
        queryParams.push(`${campaign_id}`);
        countParams.push(`${campaign_id}`);
      }
      if (statuses && statuses.length > 0) {
        conditions.push(
          `vlead.status IN (${statuses.map((status: string) => `?`).join(",")})`
        );
        queryParams.push(...statuses.map((status: any) => `${status.status}`));
        countParams.push(...statuses.map((status: any) => `${status.status}`));
      }
      if (agentes && agentes.length > 0) {
        conditions.push(
          `vlead.user IN (${agentes.map((user: string) => `?`).join(",")})`
        );
        queryParams.push(...agentes.map((user: any) => `${user.user}`));
        countParams.push(...agentes.map((user: any) => `${user.user}`));
      }
      if (nombre) {
        conditions.push(`vlead.first_name LIKE ?`);
        queryParams.push(`%${nombre}%`);
        countParams.push(`%${nombre}%`);
      }
      if (nombre_participante) {
        conditions.push(`vlead.address1 LIKE ?`);
        queryParams.push(`%${nombre_participante}%`);
        countParams.push(`%${nombre_participante}%`);
      }
      if (nombre_curso) {
        conditions.push(`vlead.address3 LIKE ?`);
        queryParams.push(`%${nombre_curso}%`);
        countParams.push(`%${nombre_curso}%`);
      }
      if (departamento) {
        conditions.push(`vlead.city LIKE ?`);
        queryParams.push(`%${departamento}%`);
        countParams.push(`%${departamento}%`);
      }
      if (profesion) {
        conditions.push(`vlead.province LIKE ?`);
        queryParams.push(`%${profesion}%`);
        countParams.push(`%${profesion}%`);
      }
      if (phone_number) {
        conditions.push(`vlead.phone_number LIKE ?`);
        queryParams.push(`%${phone_number}%`);
        countParams.push(`%${phone_number}%`);
      }
      if (email) {
        conditions.push(`vlead.email LIKE ?`);
        queryParams.push(`%${email}%`);
        countParams.push(`%${email}%`);
      }
      if (comments) {
        conditions.push(`vlead.comments LIKE ?`);
        queryParams.push(`%${comments}%`);
        countParams.push(`%${comments}%`);
      }
      if (entry_date) {
        conditions.push(`vlead.entry_date LIKE ?`);
        queryParams.push(`%${entry_date}%`);
        countParams.push(`%${entry_date}%`);
      }
      if (modify_date) {
        conditions.push(`vlead.modify_date LIKE ?`);
        queryParams.push(`%${modify_date}%`);
        countParams.push(`%${modify_date}%`);
      }
      if (datedesde) {
        conditions.push(`vlead.modify_date >= ?`);
        queryParams.push(datedesde);
        countParams.push(datedesde);
      }
      if (datehasta) {
        conditions.push(`vlead.modify_date <= ?`);
        queryParams.push(datehasta);
        countParams.push(datehasta);
      }
      // Append conditions to query if any exist
      if (conditions.length > 0) {
        query += ` ${conditions.join(" AND ")}`;
        countQuery += ` ${conditions.join(" AND ")}`;
      }
      //console.log('FECHAS', datedesde, datehasta);
      
      
      // Add pagination to main query
      query += ` ORDER BY status_code DESC LIMIT ? OFFSET ?`;
      queryParams.push(limit, offset);
      //console.log(query, queryParams);
      //console.log(countQuery, countParams);
      // Execute both queries
      const [rows] = await db.query(query, queryParams);
      const [countResult] = await db.query(countQuery, countParams);
      const total = (countResult as { total: number }[])[0].total;
      const totalPages = Math.ceil(total / limit);
      res.json({
        page,
        limit,
        total,
        totalPages,
        results: rows,
      });
    } catch (error) {
      console.error("Error al obtener leads:", error);
      res.status(500).json({ error: "Error al obtener leads" });
    }
  };
  getResumenByUser = async (req: any, res: any) => {
    const { user } = req.query;
    console.log(user);
    try {
      let query = `SELECT status, COUNT(*) AS cantidad
            FROM vicidial_list`;
      const params = [];

      if (user) {
        query += " WHERE user = ?";
        params.push(user);
      }
      query += ` GROUP BY status ORDER BY cantidad DESC;`;
      //console.log(query, params);
      const [rows] = await db.query<any[]>(query, params);
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
  getResumenByUserFiltrado = async (req: any, res: any) => {
    const {
      estado,
      cod_campaign,
      usuario,
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
      list_id,
      campaign_id,
      statuses,
      agentes,
      datedesde,
      datehasta,
      entry_date,
      modify_date,
    } = req.body;
  
    try {
      let query = `SELECT vlead.status, COUNT(*) AS cantidad
      FROM vicidial_list AS vlead
      INNER JOIN vicidial_lists AS vlist ON vlead.list_id = vlist.list_id
      INNER JOIN vicidial_campaigns AS vcampaign ON vcampaign.campaign_id = vlist.campaign_id
      LEFT JOIN vicidial_users AS vuser ON vuser.user = vlead.user`;
  
      const conditions: string[] = [];
      const params: any[] = [];
  
      if (usuario) {
        conditions.push(`vlead.user = ?`);
        params.push(`${usuario}`);
      }
      if (estado) {
        conditions.push(`vlead.status = ?`);
        params.push(`${estado}`);
      }
      if (cod_campaign) {
        conditions.push(`vlead.last_name LIKE ?`);
        params.push(`%${cod_campaign}%`);
      }
      if (list_id) {
        conditions.push(`vlead.list_id = ?`);
        params.push(`${list_id}`);
      }
      if (campaign_id) {
        conditions.push(`vlist.campaign_id = ?`);
        params.push(`${campaign_id}`);
      }
      if (statuses && statuses.length > 0) {
        conditions.push(
          `vlead.status IN (${statuses.map(() => `?`).join(",")})`
        );
        params.push(...statuses.map((s: any) => `${s.status}`));
      }
      if (agentes && agentes.length > 0) {
        conditions.push(
          `vlead.user IN (${agentes.map(() => `?`).join(",")})`
        );
        params.push(...agentes.map((u: any) => `${u.user}`));
      }
      if (nombre) {
        conditions.push(`vlead.first_name LIKE ?`);
        params.push(`%${nombre}%`);
      }
      if (nombre_participante) {
        conditions.push(`vlead.address1 LIKE ?`);
        params.push(`%${nombre_participante}%`);
      }
      if (nombre_curso) {
        conditions.push(`vlead.address3 LIKE ?`);
        params.push(`%${nombre_curso}%`);
      }
      if (departamento) {
        conditions.push(`vlead.city LIKE ?`);
        params.push(`%${departamento}%`);
      }
      if (profesion) {
        conditions.push(`vlead.province LIKE ?`);
        params.push(`%${profesion}%`);
      }
      if (phone_number) {
        conditions.push(`vlead.phone_number LIKE ?`);
        params.push(`%${phone_number}%`);
      }
      if (email) {
        conditions.push(`vlead.email LIKE ?`);
        params.push(`%${email}%`);
      }
      if (comments) {
        conditions.push(`vlead.comments LIKE ?`);
        params.push(`%${comments}%`);
      }
      if (entry_date) {
        conditions.push(`vlead.entry_date LIKE ?`);
        params.push(`%${entry_date}%`);
      }
      if (modify_date) {
        conditions.push(`vlead.modify_date LIKE ?`);
        params.push(`%${modify_date}%`);
      }
      if (datedesde) {
        conditions.push(`vlead.entry_date >= ?`);
        params.push(datedesde);
      }
      if (datehasta) {
        conditions.push(`vlead.entry_date <= ?`);
        params.push(datehasta);
      }
  
      if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(" AND ")}`;
      }
  
      query += ` GROUP BY vlead.status ORDER BY cantidad DESC`;
  
      const [rows] = await db.query<any[]>(query, params);
  
      // Crear un map con los resultados reales
      const resultMap = new Map<string, number>();
      for (const row of rows) {
        resultMap.set(row.status, row.cantidad);
      }
  
      // Completar los faltantes con 0
      const resumen = Object.entries(tipificacionesMap).map(([status, label]) => ({
        id: status,
        cantidad: resultMap.get(status) || 0,
        statusname: label,
      }));
  
      res.json(resumen);
    } catch (error) {
      console.error("Error al obtener resumen:", error);
      res.status(500).json({ error: "Error al obtener resumen" });
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

  repeticiones = async (req: any, res: any) => {
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
  };

  repeticionesglobal = async (req: any, res: any) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      const campaign_name = req.query.campaign_name;

      let query = `
        SELECT
          vlead.list_id,
          vlead.lead_id,
          vcampaign.campaign_name,
          vlead.user as usuario,
          vlead.phone_number,
          vlead.address3,
          vlead.last_name,
          vlead.modify_date,
          vlead.comments as comentario,
          vlead.modify_date
        FROM vicidial_list AS vlead
        INNER JOIN vicidial_lists AS vlist ON vlead.list_id = vlist.list_id
        INNER JOIN vicidial_campaigns AS vcampaign ON vcampaign.campaign_id = vlist.campaign_id
        WHERE vlead.phone_number IN (
          SELECT phone_number
          FROM vicidial_list
          GROUP BY phone_number
          HAVING COUNT(*) > 1
        )
      `;

      if (campaign_name) {
        query += ` AND vcampaign.campaign_name LIKE ?`;
      }

      query += `
        ORDER BY phone_number, modify_date DESC
        LIMIT ? OFFSET ?;
      `;

      const params = campaign_name
        ? [`%${campaign_name}%`, limit, offset]
        : [limit, offset];
      const [rows] = await db.query<any[]>(query, params);

      let countQuery = `
        SELECT COUNT(*) AS total
        FROM vicidial_list AS vlead
        INNER JOIN vicidial_lists AS vlist ON vlead.list_id = vlist.list_id
        INNER JOIN vicidial_campaigns AS vcampaign ON vcampaign.campaign_id = vlist.campaign_id
        WHERE vlead.phone_number IN (
          SELECT phone_number
          FROM vicidial_list
          GROUP BY phone_number
          HAVING COUNT(*) > 1
        )
      `;

      if (campaign_name) {
        countQuery += ` AND vcampaign.campaign_name LIKE ?`;
      }

      const [countResult] = await db.query<any[]>(
        countQuery,
        campaign_name ? [`%${campaign_name}%`] : []
      );
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
        return res
          .status(404)
          .json({ message: "No se pudo eliminar el registro" });
      }

      res.json({ message: "Registro eliminado correctamente" });
    } catch (error) {
      console.error("Error al eliminar el registro:", error);
      res.status(500).json({ error: "Error interno al eliminar el registro" });
    }
  };
  reasignacion = async (req: any, res: any) => {
    try {
      const {
        active_new_reasignacion,
        new_list_id,
        metodo,
        proceso,
        activacion_curso,
        activacion_promocion,
        activacion_medio,
        estado,
        cod_campaign,
        usuario,
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
        list_id,
        campaign_id,
        statuses,
        agentes,
        datedesde,
        datehasta,
      } = req.body;
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
      const [new_list_name] = await db.query(`SELECT list_name FROM vicidial_lists WHERE list_id = ?`, [new_list_id]);
      const [list_name] = await db.query(`SELECT list_name FROM vicidial_lists WHERE list_id = ?`, [list_id]);
      
      if(!list_name && proceso === 'REASIGNACION'){
        return res.status(404).json({ message: "Listas de origen no encontradas" });
      }
      if(!new_list_name && proceso === 'REASIGNACION'){
        return res.status(404).json({ message: "Listas de destino no encontradas" });
      }
      let query = `SELECT 
      vlead.lead_id,
      vlead.last_name,
      vlead.first_name,
      vlead.address1,
      vlead.address3,
      vlead.city,
      vlead.province,
      vlead.phone_number,
      vlead.alt_phone,
      vlead.email,
      vlead.comments,
      vlead.postal_code,
      vlead.status AS status_code,
      COALESCE(vstatus_camp.status_name, vstatus_sys.status_name, vlead.status) AS status_display
    FROM vicidial_list AS vlead
    INNER JOIN vicidial_lists AS vlist ON vlead.list_id = vlist.list_id
    INNER JOIN vicidial_campaigns AS vcampaign ON vcampaign.campaign_id = vlist.campaign_id
    LEFT JOIN vicidial_campaign_statuses AS vstatus_camp 
      ON vstatus_camp.status = vlead.status AND vstatus_camp.campaign_id = vcampaign.campaign_id
    LEFT JOIN vicidial_statuses AS vstatus_sys ON vstatus_sys.status = vlead.status
    LEFT JOIN vicidial_users AS vuser ON vuser.user = vlead.user
    `;
      // Array to hold query parameters
      const queryParams: any[] = [];
      if (
        usuario ||
        estado ||
        cod_campaign ||
        nombre ||
        nombre_participante ||
        nombre_curso ||
        departamento ||
        profesion ||
        phone_number ||
        email ||
        campaign ||
        campaign_id ||
        nombre ||
        comments ||
        fecha ||
        list_id ||
        campaign_id ||
        statuses ||
        agentes ||
        datedesde ||
        datehasta
      ) {
        query += " WHERE ";
      }
      // Dynamically add filter conditions
      const conditions: string[] = [];
      if (usuario) {
        conditions.push(`vlead.user = ?`);
        queryParams.push(`${usuario}`);
      }
      if (estado) {
        conditions.push(`vlead.status = ?`);
        queryParams.push(`${estado}`);
      }
      if (cod_campaign) {
        conditions.push(`vlead.last_name LIKE ?`);
        queryParams.push(`%${cod_campaign}%`);
      }
      if (list_id) {
        conditions.push(`vlead.list_id = ?`);
        queryParams.push(`${list_id}`);
      }
      if (campaign_id) {
        conditions.push(`vlist.campaign_id = ?`);
        queryParams.push(`${campaign_id}`);
      }
      if (statuses && statuses.length > 0) {
        conditions.push(
          `vlead.status IN (${statuses.map((status: string) => `?`).join(",")})`
        );
        queryParams.push(...statuses.map((status: any) => `${status.status}`));
      }
      if (agentes && agentes.length > 0) {
        conditions.push(
          `vlead.user IN (${agentes.map((user: string) => `?`).join(",")})`
        );
        queryParams.push(...agentes.map((user: any) => `${user.user}`));
      }
      if (nombre) {
        conditions.push(`vlead.first_name LIKE ?`);
        queryParams.push(`%${nombre}%`);
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
      if (profesion) {
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
      if (datedesde) {
        conditions.push(`vlead.entry_date >= ?`);
        queryParams.push(datedesde);
      }
      if (datehasta) {
        conditions.push(`vlead.entry_date <= ?`);
        queryParams.push(datehasta);
      }
      // Append conditions to query if any exist
      if (conditions.length > 0) {
        query += ` ${conditions.join(" AND ")}`;
      }
      query += `;`;
      //console.log(query, queryParams);
      const [rows] = await db.query(query, queryParams);
      /*
      vlead.last_name,
      vlead.first_name,
      vlead.address1,
      vlead.address3,
      vlead.city,
      vlead.province,
      vlead.phone_number,
      vlead.alt_phone,
      vlead.email,
      vlead.comments,
      vlead.postal_code,
      vlead.status AS status_code,
      COALESCE(vstatus_camp.status_name, vstatus_sys.status_name, vlead.status) AS status_display
      */
     //console.log('lista name:',(new_list_name as any[]).length != 0);
     const newlista = (new_list_name as any[]).length != 0 ? (new_list_name as any[])[0].list_name : null;
     const listanombre = (list_name as any[]).length != 0 ? (list_name as any[])[0].list_name : null;
     //console.log(newlista);
      const [result_insert_reasignaciones] = await dbmalcriada.query(
        `INSERT INTO vicidial_reasignaciones (origen_list_id, origen_list_name, destino_list_id, destino_list_name, metodo, cantidad, fecha, proceso, activacion_curso, activacion_promocion, activacion_medio) 
        values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
        [
          list_id ?? null,
          listanombre,
          new_list_id != '' ? new_list_id : null,
          newlista,
          metodo,
          (rows as any[]).length,
          new Date(),
          proceso,
          activacion_curso,
          activacion_promocion,
          activacion_medio,
        ]);
      for (const row of rows as any[]) {
        await db.query(`INSERT INTO vicidial_list (
        last_name,
        first_name,
        address1,
        address3,
        city,
        province,
        phone_number,
        alt_phone,
        email,
        postal_code,
        list_id,
        status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          row.last_name,
          row.first_name,
          row.address1,
          row.address3,
          row.city,
          row.province,
          row.phone_number,
          row.alt_phone,
          row.email,
          row.postal_code,
          new_list_id,
          'NEW'
        ]);
        if(metodo === 'elimina'){
          await db.query('DELETE FROM vicidial_list WHERE lead_id = ?', [row.lead_id]);
        }
        await dbmalcriada.query(`INSERT INTO vicidial_reasignacion (reasignaciones_id, lead_id, last_name, first_name, address1, address3, city, province, phone_number, alt_phone, email, postal_code, status, comments) 
          values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
          [
            (result_insert_reasignaciones as any).insertId,
            row.lead_id,
            row.last_name,
            row.first_name,
            row.address1,
            row.address3,
            row.city,
            row.province,
            row.phone_number,
            row.alt_phone,
            row.email,
            row.postal_code,
            row.status,
            row.comments
          ]);
      }
      //enviar a nueva 
      if(active_new_reasignacion){
        await db.query(`UPDATE vicidial_lists SET active = ? WHERE list_id = ?`, [active_new_reasignacion, new_list_id]);
      }
      
      
      res.json({
        results: rows,
      });
    } catch (error) {
      console.error("Error al reasignar el registro:", error);
      res.status(500).json({ error: "Error interno al reasignar el registro" });
    }
  };
  changeStatusByList = async (req: any, res: any) => {
    try {
      const { lead_id, status } = req.body;
      const [result] = await db.query(
        `UPDATE vicidial_list SET status = ? WHERE lead_id = ?`,
        [status, lead_id]
      );
      res.json({
        result,
      });
    } catch (error) {
      console.error("Error al cambiar el estado de la lista:", error);
      res.status(500).json({ error: "Error interno al cambiar el estado de la lista" });
    }
  };
  changeCommentByList = async (req: any, res: any) => {
    try {
      const { lead_id, comments } = req.body;
      const [result] = await db.query(
        `UPDATE vicidial_list SET comments = ? WHERE lead_id = ?`,
        [comments, lead_id]
      );
      res.json({
        result,
      });
    } catch (error) {
      console.error("Error al cambiar el comentario de la lista:", error);
      res.status(500).json({ error: "Error interno al cambiar el comentario de la lista" });
    }
  };
}
