import { Router} from 'express';
import { db } from '../config/db';
import { HistorialController } from '../core/Historial/HistorialController';
import { verifyToken } from '../core/auth/auth.middleware';

const GestionHistorialRouter = Router();
const historialController = new HistorialController();

GestionHistorialRouter.get('/:userId', verifyToken, historialController.getAllByUser);
GestionHistorialRouter.get('/resumen/:userId', historialController.getResumenByUser);

export default GestionHistorialRouter;
