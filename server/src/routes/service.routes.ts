import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import * as serviceController from '../controllers/service.controller';

const router = Router({ mergeParams: true });

router.use(requireAuth);

router.post('/', serviceController.createService);
router.get('/', serviceController.getServiceList);
router.get('/:serviceId', serviceController.getService);
router.delete('/:serviceId', serviceController.deleteService);
// no PATCH — a service visit is treated as immutable once logged; delete + recreate instead

export default router;