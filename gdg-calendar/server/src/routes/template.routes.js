import { Router } from 'express';
import {
  getTemplates,
  patchTemplate,
  postTemplate,
  removeTemplate,
} from '../controllers/template.controller.js';
import { auth } from '../middleware/auth.js';
import { role } from '../middleware/role.js';
import { validate } from '../middleware/validate.js';
import { createTemplateSchema, updateTemplateSchema } from '../validators/template.validator.js';

const router = Router();

router.use(auth);

router.get('/', getTemplates);
router.post('/', role('admin'), validate(createTemplateSchema), postTemplate);
router.patch('/:id', role('admin'), validate(updateTemplateSchema), patchTemplate);
router.delete('/:id', role('admin'), removeTemplate);

export default router;

