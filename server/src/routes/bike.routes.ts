import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import * as bikeController from '../controllers/bike.controller';
import maintenanceRoutes from './maintenance.routes';
import fuelRoutes from './fuel.routes';
import serviceRoutes from './service.routes';
import documentRoutes from './document.routes';
import { validate } from '../middlewares/validate.middleware';
import {
  bikeIdParamsSchema,
  createBikeSchema,
  updateBikeSchema,
} from '../validation/schemas';


const router = Router();

router.use(requireAuth); // all bike routes require auth

router.post('/', validate(createBikeSchema), bikeController.createBike);
router.get('/', bikeController.getBikes);
router.get('/:id', validate(bikeIdParamsSchema, 'params'), bikeController.getBike);
router.patch('/:id', validate(bikeIdParamsSchema, 'params'), validate(updateBikeSchema), bikeController.updateBike);
router.delete('/:id', validate(bikeIdParamsSchema, 'params'), bikeController.deleteBike);


// Nested resource: /bikes/:bikeId/maintenance/...
router.use('/:bikeId/maintenance', maintenanceRoutes);
// Nested resource: /bikes/:bikeId/fuel/...
router.use('/:bikeId/fuel', fuelRoutes);
//Nested resource: /bikes/:bikeId/service/...
router.use('/:bikeId/services', serviceRoutes);
// Nested resource: /bikes/:bikeId/documents/...
router.use('/:bikeId/documents', documentRoutes);
// Nested resource: /bikes/:bikeId/dashboard/...
router.get('/:id/dashboard', validate(bikeIdParamsSchema, 'params'), bikeController.getDashboard);


export default router;