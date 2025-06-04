import { Router} from 'express';
import { db } from '../config/db';
import { HistorialController } from '../core/Historial/HistorialController';

const GestionHistorialRouter = Router();
const historialController = new HistorialController();
GestionHistorialRouter.get('/:userId', historialController.getAllByUser);
GestionHistorialRouter.get('/resumen/:userId', historialController.getResumenByUser);

export default GestionHistorialRouter;
