import { prisma } from '../../config/db';
import { paginate } from '../../utils/pagination';

const makeError = (msg: string, code: number) => { const err = new Error(msg) as Error & { statusCode: number }; err.statusCode = code; return err; };

export const resolveReportService = async (reportId: string, actorId: string, data: { reason: string; targetUserId?: string }) => {
  const report = await prisma.report.findUnique({ where: { id: reportId } });
  if (!report) throw makeError('Report not found', 404);
  const [updatedReport] = await prisma.$transaction([
    prisma.report.update({ where: { id: reportId }, data: { status: 'RESOLVED' } }),
    prisma.moderationLog.create({
      data: {
        actorId,
        reason: data.reason,
        targetUserId: data.targetUserId ?? report.reporterId,
      },
    }),
  ]);
  return updatedReport;
};

export const getModerationLogsService = async (page: number, limit: number) => {
  const [data, total] = await Promise.all([
    prisma.moderationLog.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        actor: { select: { username: true, displayName: true } },       // ✅ actorId relation
        targetUser: { select: { username: true, displayName: true } },  // ✅ targetUserId relation
      },
    }),
    prisma.moderationLog.count(),
  ]);
  return { data, meta: paginate(total, page, limit) };
};
