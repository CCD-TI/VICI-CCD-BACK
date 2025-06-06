import { Router} from 'express';
import { db } from '../config/db';
import { TiempollamadaController } from '../core/Historial/TiempoLlamadaController';
import { requireAdmin, verifyToken } from '../core/auth/auth.middleware';

const tiempollamadaRouter = Router();
const tiempollamadaController = new TiempollamadaController();

tiempollamadaRouter.get('/', verifyToken, requireAdmin, tiempollamadaController.getByDate);
tiempollamadaRouter.get('/usuario/:userId', tiempollamadaController.getAllByUser);

//GestionHistorialRouter.get('/resumen/:userId', historiauserslController.getResumenByUser);

export default tiempollamadaRouter;
