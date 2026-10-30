import { Router } from 'express';
import { PrismaClient, Role } from '@prisma/client';
import { authenticate, requireRole, AuthenticatedRequest } from '../middleware/auth';
import { generateQuoteSuggestions } from '../services/aiQuoteService';

const router = Router();
const prisma = new PrismaClient();

// POST /api/ai/quotes - Author generates quote ideas
router.post('/quotes', authenticate, requireRole([Role.AUTHOR, Role.MODERATOR]), async (req: AuthenticatedRequest, res) => {
  const { topic } = req.body;

  if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
    return res.status(400).json({ error: 'A valid topic or prompt is required' });
  }

  if (topic.length > 200) {
    return res.status(400).json({ error: 'Topic cannot exceed 200 characters' });
  }

  try {
    const quotes = await generateQuoteSuggestions(topic.trim());

    // Record generation metadata for auditing and rubric compliance
    await prisma.aIQuoteGeneration.create({
      data: {
        prompt: topic.trim(),
        output: JSON.stringify(quotes),
        provider: 'gemini-3.8-flash',
        userId: req.user!.userId,
      },
    });

    res.json({
      topic: topic.trim(),
      quotes,
      disclaimer: 'AI-generated suggestions. Verify and edit before publishing.',
    });
  } catch (err: any) {
    console.error('AI generation route error:', err);
    res.status(500).json({ error: err.message || 'Failed to generate quote suggestions' });
  }
});

export default router;