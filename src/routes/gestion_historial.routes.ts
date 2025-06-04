import { Router } from 'express';
import { getGestion } from '../controllers/gestion_historial.controller';
import { verifyToken } from '../auth/auth.middleware';

const router = Router();

router.get('/:userId', verifyToken, getGestion);

export default router;