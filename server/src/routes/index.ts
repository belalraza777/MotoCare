import { Router } from 'express';
import bikeRoutes from './bike.routes';

const router = Router();

//Routes
//Bike Routes
router.use('/bikes', bikeRoutes);

export default router;