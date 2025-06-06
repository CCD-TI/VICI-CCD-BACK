const tipificacionesMap: Record<string, string> = {
    "1101": "MATRICULADO",
    "1102": "PAGO INCOMPLETO",
    "1202": "MUY INTERESADO",
    "1201": "VOLVER A LLAMAR",
    "1203": "SEPARACIÓN DE VACANTE",
    "1301": "PRECIO FUERA PRESUPUESTO",
    "1302": "NO DESEA POR HORARIO",
    "1303": "PARA PRÓXIMO INICIO",
    "1304": "NO PIDIÓ INFO",
    "1305": "DESEA OTRA ESPECIALIDAD",
    "1313": "NO DESEA, NO DA MOTIVOS",
    "1316": "PIDE NO CONTACTAR",
    "1318": "CUELGA ANTES INFO",
    "2203": "NÚMERO NO PERTENECE",
    "4101": "NO CONTESTA",
    "4102": "CASILLA DE VOZ",
    "4201": "NÚMERO FUERA DE SERVICIO"
} as const;

export const mapTipificacion = (status: string): string => {
    return tipificacionesMap[status as keyof typeof tipificacionesMap] || "DESCONOCIDO";
};