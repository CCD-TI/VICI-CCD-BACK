import { Router } from "express";
import { ListsController } from "../core/Lists/ListsController";

const listsRouter = Router();
const listsController = new ListsController();

listsRouter.get('/getAll', listsController.getAll);
listsRouter.get('/getOne/:list', listsController.getOne);
listsRouter.get('/getByCampaign/:campaign_id', listsController.getByCampaign);
listsRouter.post('/create', listsController.create);
export default listsRouter;
