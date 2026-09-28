import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import * as bikeController from '../controllers/bike.controller';
import maintenanceRoutes from './maintenance.routes';
import fuelRoutes from './fuel.routes';


const router = Router();

router.use(requireAuth); // all bike routes require auth

router.post('/', bikeController.createBike);
router.get('/', bikeController.getBikes);
router.get('/:id', bikeController.getBike);
router.patch('/:id', bikeController.updateBike);
router.delete('/:id', bikeController.deleteBike);


// Nested resource: /bikes/:bikeId/maintenance/...
router.use('/:bikeId/maintenance', maintenanceRoutes);
// Nested resource: /bikes/:bikeId/fuel/...
router.use('/:bikeId/fuel', fuelRoutes);

export default router;