import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import * as maintenanceController from '../controllers/maintenance.controller';

// mergeParams lets this router read :bikeId from the parent route it's mounted under
const router = Router({ mergeParams: true });

router.use(requireAuth);

router.post('/', maintenanceController.createMaintenance);
router.get('/', maintenanceController.getMaintenanceList);
router.get('/:maintenanceId', maintenanceController.getMaintenance);
router.patch('/:maintenanceId', maintenanceController.updateMaintenance);
router.delete('/:maintenanceId', maintenanceController.deleteMaintenance);

export default router;