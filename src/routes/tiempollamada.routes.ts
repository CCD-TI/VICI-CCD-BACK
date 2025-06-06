import { Router} from 'express';
import { db } from '../config/db';
import { TiempollamadaController } from '../core/Historial/TiempoLlamadaController';
import { verifyToken } from '../core/auth/auth.middleware';

const tiempollamadaRouter = Router();
const tiempollamadaControlller = new TiempollamadaController();

tiempollamadaRouter.get('/usuario/:userId', tiempollamadaControlller.getAllByUser);
//GestionHistorialRouter.get('/resumen/:userId', historiauserslController.getResumenByUser);

export default tiempollamadaRouter;
