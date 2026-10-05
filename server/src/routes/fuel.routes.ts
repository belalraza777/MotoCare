import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import * as fuelController from '../controllers/fuel.controller';
import { validate } from '../middlewares/validate.middleware';
import {
  fuelIdParamsSchema,
  fuelSchema,
  nestedBikeIdParamsSchema,
  updateFuelSchema,
} from '../validation/schemas';

const router = Router({ mergeParams: true }); // inherits :bikeId from the parent bike route

router.use(requireAuth);

router.post('/', validate(nestedBikeIdParamsSchema, 'params'), validate(fuelSchema), fuelController.createFuel);
router.get('/', fuelController.getFuelList);
router.get('/:fuelId', validate(fuelIdParamsSchema, 'params'), fuelController.getFuel);
router.patch('/:fuelId', validate(fuelIdParamsSchema, 'params'), validate(updateFuelSchema), fuelController.updateFuel);
router.delete('/:fuelId', validate(fuelIdParamsSchema, 'params'), fuelController.deleteFuel);

export default router;