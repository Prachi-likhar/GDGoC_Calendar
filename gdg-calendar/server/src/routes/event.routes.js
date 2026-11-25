import { Router } from 'express';
import {
  copyEvent,
  getEvent,
  getEvents,
  patchEvent,
  postEvent,
  previewConflicts,
  removeEvent,
} from '../controllers/event.controller.js';
import {
  getEventSessions,
  patchReorderSessions,
  postSession,
} from '../controllers/session.controller.js';
import { getEventTasks, postTask } from '../controllers/task.controller.js';
import {
  getAttendance,
  getRegistrations,
  postCheckIn,
} from '../controllers/registration.controller.js';
import {
  getCertificatesZip,
  getFeedback,
  getReport,
} from '../controllers/insights.controller.js';
import { auth } from '../middleware/auth.js';
import { role } from '../middleware/role.js';
import { validate } from '../middleware/validate.js';
import {
  conflictPreviewQuerySchema,
  createEventSchema,
  updateEventSchema,
} from '../validators/event.validator.js';
import { createSessionSchema, reorderSessionsSchema } from '../validators/session.validator.js';
import { createTaskSchema } from '../validators/task.validator.js';
import { checkInSchema } from '../validators/registration.validator.js';

const router = Router();

router.use(auth);

router.get('/', getEvents);
router.get(
  '/conflicts',
  role('admin', 'domain_head'),
  validate(conflictPreviewQuerySchema, 'query'),
  previewConflicts
);
router.post('/', role('admin', 'domain_head'), validate(createEventSchema), postEvent);
router.get('/:id', getEvent);
router.patch('/:id', role('admin', 'domain_head'), validate(updateEventSchema), patchEvent);
router.delete('/:id', role('admin'), removeEvent);
router.post('/:id/duplicate', role('admin', 'domain_head'), copyEvent);

router.get('/:id/tasks', getEventTasks);
router.post('/:id/tasks', role('admin', 'domain_head'), validate(createTaskSchema), postTask);

router.get('/:id/sessions', getEventSessions);
router.post('/:id/sessions', role('admin', 'domain_head'), validate(createSessionSchema), postSession);
router.patch(
  '/:id/sessions/reorder',
  role('admin', 'domain_head'),
  validate(reorderSessionsSchema),
  patchReorderSessions
);

router.get('/:id/registrations', role('admin', 'domain_head'), getRegistrations);
router.post('/:id/checkin', role('admin', 'domain_head'), validate(checkInSchema), postCheckIn);
router.get('/:id/attendance', role('admin', 'domain_head'), getAttendance);
router.get('/:id/feedback', role('admin', 'domain_head'), getFeedback);
router.get('/:id/certificates.zip', role('admin', 'domain_head'), getCertificatesZip);
router.get('/:id/report', role('admin', 'domain_head'), getReport);

export default router;

