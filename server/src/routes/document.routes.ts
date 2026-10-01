import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import * as documentController from '../controllers/document.controller';

const router = Router({ mergeParams: true });

router.use(requireAuth);

router.post('/', documentController.upsertDocument);
router.get('/', documentController.getDocumentList);
router.get('/:documentId', documentController.getDocument);
router.delete('/:documentId', documentController.deleteDocument);

export default router;