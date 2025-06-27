import { Router} from 'express';
import { HistorialController } from '../core/Historial/HistorialController';
import { requireAdmin, verifyToken } from '../core/auth/auth.middleware';

const GestionHistorialRouter = Router();
const historialController = new HistorialController();

GestionHistorialRouter.post('/changestatusbylist', historialController.changeStatusByList);
GestionHistorialRouter.post('/changecommentbylist', historialController.changeCommentByList);
GestionHistorialRouter.get('/repeticiones/global', verifyToken, requireAdmin, historialController.repeticionesglobal);
GestionHistorialRouter.get('/resumen', historialController.getResumenByUser);
GestionHistorialRouter.post('/resumenFiltrado', historialController.getResumenByUserFiltrado);
GestionHistorialRouter.post('/getAll', verifyToken, historialController.getAllByUser);
GestionHistorialRouter.post('/reasignacion', historialController.reasignacion);

GestionHistorialRouter.delete('/:leadId', verifyToken, requireAdmin, historialController.deleteById);
export default GestionHistorialRouter;
