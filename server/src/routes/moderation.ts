import { Router } from 'express';
import { PrismaClient, ReportStatus, ModerationActionType, PostStatus, Role } from '@prisma/client';
import { authenticate, requireRole, AuthenticatedRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// POST /api/moderation/reports - Authenticated user reports a post
router.post('/reports', authenticate, async (req: AuthenticatedRequest, res) => {
  const { postId, reason } = req.body;

  if (!postId || !reason) {
    return res.status(400).json({ error: 'Post ID and reason are required' });
  }

  try {
    const report = await prisma.report.create({
      data: {
        postId,
        reason,
        reporterId: req.user!.userId,
        status: ReportStatus.PENDING,
      },
    });

    res.status(201).json({ report, message: 'Report submitted for review' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit report' });
  }
});

// GET /api/moderation/queue - Moderator lists pending reports
router.get('/queue', authenticate, requireRole([Role.MODERATOR]), async (_req, res) => {
  try {
    const reports = await prisma.report.findMany({
      where: { status: ReportStatus.PENDING },
      orderBy: { createdAt: 'desc' },
      include: {
        reporter: { select: { name: true, email: true } },
        post: {
          select: {
            id: true,
            title: true,
            slug: true,
            body: true,
            status: true,
            author: { select: { name: true, email: true } },
          },
        },
      },
    });

    res.json({ reports });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch moderation queue' });
  }
});

// POST /api/moderation/resolve - Atomic Transaction: record action, update report, change post status
router.post('/resolve', authenticate, requireRole([Role.MODERATOR]), async (req: AuthenticatedRequest, res) => {
  const { reportId, action, reason } = req.body;

  if (!reportId || !action) {
    return res.status(400).json({ error: 'Report ID and action are required' });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const report = await tx.report.findUnique({
        where: { id: reportId },
      });

      if (!report) {
        throw new Error('Report not found');
      }

      // 1. Audit trail in ModerationAction
      const modAction = await tx.moderationAction.create({
        data: {
          action: action as ModerationActionType,
          reason,
          reportId,
          moderatorId: req.user!.userId,
        },
      });

      // 2. Update post visibility if target action is HIDE_POST or RESTORE_POST
      if (report.postId) {
        if (action === ModerationActionType.HIDE_POST) {
          await tx.post.update({
            where: { id: report.postId },
            data: { status: PostStatus.HIDDEN },
          });
        } else if (action === ModerationActionType.RESTORE_POST) {
          await tx.post.update({
            where: { id: report.postId },
            data: { status: PostStatus.PUBLISHED },
          });
        }
      }

      // 3. Mark report as resolved or dismissed
      const updatedReport = await tx.report.update({
        where: { id: reportId },
        data: {
          status: action === ModerationActionType.DISMISS_REPORT ? ReportStatus.DISMISSED : ReportStatus.RESOLVED,
        },
      });

      return { modAction, updatedReport };
    });

    res.json({ message: 'Moderation action applied successfully', result });
  } catch (err: any) {
    console.error('Moderation transaction error:', err);
    res.status(500).json({ error: err.message || 'Transaction failed' });
  }
});

export default router;