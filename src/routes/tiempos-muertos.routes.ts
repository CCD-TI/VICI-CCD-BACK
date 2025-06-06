import { Router} from 'express';
import { DeadTimeController } from '../core/TiemposMuertos/TiemposMuertosController';
import { requireAdmin, verifyToken } from '../core/auth/auth.middleware';

const TiemposMuertosRouter = Router();
const deadTimeController = new DeadTimeController();

TiemposMuertosRouter.get('/totalPausas', verifyToken, requireAdmin, deadTimeController.getTiempoTotal);
TiemposMuertosRouter.get('/pausasPorTipo', verifyToken, deadTimeController.getTiemposPorTipo);
TiemposMuertosRouter.get('/pausasPorTipoFecha', verifyToken, deadTimeController.getTiemposPorTipoFecha);

export default TiemposMuertosRouter;
