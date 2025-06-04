import { Router} from 'express';
import { db } from '../config/db';
import { HistorialusersController } from '../core/Historial/HistorialusersController';
import { verifyToken } from '../core/auth/auth.middleware';

const HistorialUserslRouter = Router();
const historiauserslController = new HistorialusersController();

HistorialUserslRouter.get('/:userId', historiauserslController.getAllByUser);
//GestionHistorialRouter.get('/resumen/:userId', historiauserslController.getResumenByUser);

export default HistorialUserslRouter;
