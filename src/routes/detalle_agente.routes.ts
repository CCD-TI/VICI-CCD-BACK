import { Router } from 'express';
import { UserLogController } from '../core/Historial/DetalleAgenteController';
import { requireAdmin, verifyToken } from '../core/auth/auth.middleware';

const DetalleRouter = Router();
const userLogController = new UserLogController();

DetalleRouter.get('/', verifyToken, requireAdmin, userLogController.getLogsByUser);
DetalleRouter.get('/user', verifyToken, requireAdmin, userLogController.getUsers);

export default DetalleRouter;
