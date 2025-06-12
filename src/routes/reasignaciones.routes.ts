import { Router } from "express";
import { ReasignacionesController } from "../core/Reasignaciones/ReasignacionesController";

const ReasignacionesRouter = Router();
const reasignacionesController = new ReasignacionesController();
ReasignacionesRouter.get('/getAll', reasignacionesController.getAll);
ReasignacionesRouter.get('/getOne/:id', reasignacionesController.getOne);
ReasignacionesRouter.get('/getContent/:id', reasignacionesController.getContent);
export default ReasignacionesRouter;