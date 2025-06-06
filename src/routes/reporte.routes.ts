import { Router} from 'express';
import { ReporteController } from '../core/Reporte/ReporteController';

const ReporteRouter = Router();
const reporteController = new ReporteController();

ReporteRouter.get('/TipificacionesPorDia', reporteController.TipificacionesPorDia);

export default ReporteRouter;
