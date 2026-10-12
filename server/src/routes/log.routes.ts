import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { getLogs } from '../controllers/log.controller';

const router = Router();

router.get('/', requireAuth, getLogs);

export default router;