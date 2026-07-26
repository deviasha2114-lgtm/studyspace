import { Request, Response, NextFunction } from 'express';
import { resolveReportService, getModerationLogsService } from './moderation.service';

export const resolveReportController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { reason, targetUserId } = req.body as { reason: string; targetUserId?: string };
    const r = await resolveReportService(req.params.id, req.user!.sub, { reason, targetUserId });
    res.status(200).json({ success: true, data: r });
  } catch (err) { next(err); }
};
export const getModerationLogsController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try { const { page = '1', limit = '20' } = req.query as Record<string, string>; const result = await getModerationLogsService(+page, +limit); res.status(200).json({ success: true, ...result }); } catch (err) { next(err); }
};
