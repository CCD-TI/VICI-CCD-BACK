import { db } from "../../config/db";

export class HistorialController {
    
    getAllByUser = async (req: any, res: any) => {
        const { userId } = req.params;
      
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
            ORDER BY status_code, modify_date DESC`,
            [userId]
          );
      
          res.json(rows);
        } catch (error) {
          console.error('Error al obtener leads:', error);
          res.status(500).json({ error: 'Error al obtener leads' });
        }
    }
    getResumenByUser = async (req: any , res: any) => {
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
          statusname: this.significado(res.status),
          cantidad: res.cantidad
        }))
        res.json(resumen);
      } catch (error) {
        console.error('Error al obtener leads:', error);
        res.status(500).json({ error: 'Error al obtener leads' });
      }
    }
    private significado =  (id: string) => {
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
        case '1101':
          return 'MATRICULADO'
        case '1102':
          return 'PAGO INCOMPLETO'
        case '1202':
          return 'MUY INTERESADO'
        case '1203':
          return 'SEPARACIÓN DE VACANTE'
        case '1301':
          return 'PRECIO FUERA PRESUPUESTO'
        case '1302':
          return 'NO DESEA POR HORARIO'
        case '1303':
          return 'PARA PRÓXIMO INICIO'
        case '1304':
          return 'NO PIDIÓ INFO'
        case '1305':
          return 'DESEA OTRA ESPECIALIDAD'
        case '1313':
          return 'NO DESEA, NO DA MOTIVOS'
        case '1316':
          return 'PIDE NO CONTACTAR'
        case '1318':
          return 'CUELGA ANTES INFO'
        case '2203':
          return 'NÚMERO NO PERTENECE'
        case '4101':
          return 'NO CONTESTA'
        case '4102':
          return 'CASILLA DE VOZ'
        case '4201':
          return 'NÚMERO FUERA DE SERVICIO'
      }
    }
}
