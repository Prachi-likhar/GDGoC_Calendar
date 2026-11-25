import { Router } from 'express';
import { getMyTasks, patchTask, removeTask } from '../controllers/task.controller.js';
import { auth } from '../middleware/auth.js';
import { role } from '../middleware/role.js';
import { validate } from '../middleware/validate.js';
import { updateTaskSchema } from '../validators/task.validator.js';

const router = Router();

router.use(auth);

router.get('/mine', getMyTasks);
router.patch('/:id', validate(updateTaskSchema), patchTask);
router.delete('/:id', role('admin', 'domain_head'), removeTask);

export default router;

