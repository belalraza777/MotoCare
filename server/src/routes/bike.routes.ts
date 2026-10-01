import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import * as bikeController from '../controllers/bike.controller';
import maintenanceRoutes from './maintenance.routes';
import fuelRoutes from './fuel.routes';
import serviceRoutes from './service.routes';
import documentRoutes from './document.routes';


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
//Nested resource: /bikes/:bikeId/service/...
router.use('/:bikeId/services', serviceRoutes);
// Nested resource: /bikes/:bikeId/documents/...
router.use('/:bikeId/documents', documentRoutes);
// Nested resource: /bikes/:bikeId/dashboard/...
router.get('/:id/dashboard', bikeController.getDashboard);


export default router;