import { Router } from 'express';
import bikeRoutes from './bike.routes';
import logRoutes from './log.routes';

const router = Router();

//Routes
//Bike Routes
router.use('/bikes', bikeRoutes);

//Log Routes
router.use('/logs', logRoutes);

export default router;