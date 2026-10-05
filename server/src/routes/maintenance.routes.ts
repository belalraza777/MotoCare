import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import * as maintenanceController from '../controllers/maintenance.controller';
import { validate } from '../middlewares/validate.middleware';
import {
  maintenanceIdParamsSchema,
  maintenanceSchema,
  nestedBikeIdParamsSchema,
  updateMaintenanceSchema,
} from '../validation/schemas';

// mergeParams lets this router read :bikeId from the parent route it's mounted under
const router = Router({ mergeParams: true });

router.use(requireAuth);

router.post('/', validate(nestedBikeIdParamsSchema, 'params'), validate(maintenanceSchema), maintenanceController.createMaintenance);
router.get('/', maintenanceController.getMaintenanceList);
router.get('/:maintenanceId', validate(maintenanceIdParamsSchema, 'params'), maintenanceController.getMaintenance);
router.patch('/:maintenanceId', validate(maintenanceIdParamsSchema, 'params'), validate(updateMaintenanceSchema), maintenanceController.updateMaintenance);
router.delete('/:maintenanceId', validate(maintenanceIdParamsSchema, 'params'), maintenanceController.deleteMaintenance);

export default router;