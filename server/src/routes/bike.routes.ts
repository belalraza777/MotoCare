import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import * as bikeController from '../controllers/bike.controller';

const router = Router();

router.use(requireAuth); // all bike routes require auth

router.post('/', bikeController.createBike);
router.get('/', bikeController.getBikes);
router.get('/:id', bikeController.getBike);
router.patch('/:id', bikeController.updateBike);
router.delete('/:id', bikeController.deleteBike);

export default router;