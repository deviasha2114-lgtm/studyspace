import { Router } from 'express';
import { resolveReportController, getModerationLogsController } from './moderation.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';

const router = Router();
router.patch('/reports/:id/resolve', authenticate, requireRole('ADMIN', 'MODERATOR'), resolveReportController);
router.get('/logs', authenticate, requireRole('ADMIN'), getModerationLogsController);
export default router;
