import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import * as bikeController from '../controllers/bike.controller';
import maintenanceRoutes from './maintenance.routes';


const router = Router();

router.use(requireAuth); // all bike routes require auth

router.post('/', bikeController.createBike);
router.get('/', bikeController.getBikes);
router.get('/:id', bikeController.getBike);
router.patch('/:id', bikeController.updateBike);
router.delete('/:id', bikeController.deleteBike);


// Nested resource: /bikes/:bikeId/maintenance/...
router.use('/:bikeId/maintenance', maintenanceRoutes);

export default router;