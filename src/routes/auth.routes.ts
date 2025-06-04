import { Router } from 'express';
import { AuthController } from '../core/auth/auth.controller';

const AuthRouter = Router();
const authController = new AuthController();
AuthRouter.post('/login', authController.login);

export default AuthRouter;
