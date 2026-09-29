import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import * as fuelController from '../controllers/fuel.controller';

const router = Router({ mergeParams: true }); // inherits :bikeId from the parent bike route

router.use(requireAuth);

router.post('/', fuelController.createFuel);
router.get('/', fuelController.getFuelList);
router.get('/:fuelId', fuelController.getFuel);
router.patch('/:fuelId', fuelController.updateFuel);
router.delete('/:fuelId', fuelController.deleteFuel);

export default router;