import { Router } from "express";
import { CampaignController } from "../core/Campaign/CampaignController";

const CampaignRouter = Router();
const campaignController = new CampaignController();

CampaignRouter.get('/getAll', campaignController.getAll);
CampaignRouter.get('/getOne/:campaign', campaignController.getOne);
CampaignRouter.post('/create', campaignController.create);
export default CampaignRouter;
