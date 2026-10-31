import { Router } from 'express';
import { PrismaClient, Role } from '@prisma/client';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// GET /api/analytics/summary - Aggregates & Group By demonstration
router.get('/summary', authenticate, requireRole([Role.MODERATOR]), async (_req, res) => {
  try {
    // 1. Count posts grouped by status
    const postsByStatus = await prisma.post.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    // 2. Count reports grouped by status
    const reportsByStatus = await prisma.report.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    // 3. Top authors by published post count (Aggregation + Join)
    const authorStats = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        _count: {
          select: { posts: true, comments: true },
        },
      },
      take: 5,
    });

    res.json({
      postsByStatus,
      reportsByStatus,
      authorStats,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve analytics' });
  }
});

router.get('/post-view', authenticate, requireRole([Role.MODERATOR]), async (_req, res) => {
  try {
    const stats = await prisma.$queryRaw`SELECT * FROM "PostAnalyticsView" ORDER BY "reportCount" DESC LIMIT 10;`;
    res.json({ stats });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: 'Failed to query analytics view' });
  }
});

export default router;