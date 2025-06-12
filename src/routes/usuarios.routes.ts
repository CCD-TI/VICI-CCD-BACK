import { Router } from "express";
import { UsuariosController } from "../core/Usuarios/UsuariosController";
const UsuariosRouter = Router();
const usuariosController = new UsuariosController();

UsuariosRouter.get('/getAll', usuariosController.getAll);
UsuariosRouter.get('/getOne/:user', usuariosController.getOne);
UsuariosRouter.post('/UsuariosEn', usuariosController.getUsuariosEn);
export default UsuariosRouter;
