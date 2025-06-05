import { Router} from 'express';
import { HistorialController } from '../core/Historial/HistorialController';
import { requireAdmin, verifyToken } from '../core/auth/auth.middleware';

const GestionHistorialRouter = Router();
const historialController = new HistorialController();

GestionHistorialRouter.get('/repeticiones/global', verifyToken, requireAdmin, historialController.repeticionesglobal);
GestionHistorialRouter.get('/resumen/:userId', historialController.getResumenByUser);
GestionHistorialRouter.get('/:userId', verifyToken, historialController.getAllByUser);
GestionHistorialRouter.delete('/:leadId', verifyToken, requireAdmin, historialController.deleteById);

export default GestionHistorialRouter;
