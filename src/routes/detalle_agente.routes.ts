import { Router } from 'express';
import { UserLogController } from '../core/Historial/DetalleAgenteController';

const DetalleRouter = Router();
const userLogController = new UserLogController();

DetalleRouter.get('/user', userLogController.getUsers);
DetalleRouter.get('/:userId', userLogController.getLogsByUser);

export default DetalleRouter;
