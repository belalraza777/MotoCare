import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import * as serviceController from '../controllers/service.controller';
import { validate } from '../middlewares/validate.middleware';
import { nestedBikeIdParamsSchema, serviceIdParamsSchema, serviceSchema } from '../validation/schemas';

const router = Router({ mergeParams: true });

router.use(requireAuth);

router.post('/', validate(nestedBikeIdParamsSchema, 'params'), validate(serviceSchema), serviceController.createService);
router.get('/', serviceController.getServiceList);
router.get('/:serviceId', validate(serviceIdParamsSchema, 'params'), serviceController.getService);
router.delete('/:serviceId', validate(serviceIdParamsSchema, 'params'), serviceController.deleteService);
// no PATCH — a service visit is treated as immutable once logged; delete + recreate instead

export default router;