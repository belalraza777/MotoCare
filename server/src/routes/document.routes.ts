import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import * as documentController from '../controllers/document.controller';
import { validate } from '../middlewares/validate.middleware';
import { documentIdParamsSchema, documentSchema, nestedBikeIdParamsSchema } from '../validation/schemas';

const router = Router({ mergeParams: true });

router.use(requireAuth);

router.post('/', validate(nestedBikeIdParamsSchema, 'params'), validate(documentSchema), documentController.upsertDocument);
router.get('/', documentController.getDocumentList);
router.get('/:documentId', validate(documentIdParamsSchema, 'params'), documentController.getDocument);
router.delete('/:documentId', validate(documentIdParamsSchema, 'params'), documentController.deleteDocument);

export default router;