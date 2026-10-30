import { Router } from 'express';
import { PrismaClient, PostStatus, Role } from '@prisma/client';
import { authenticate, requireRole, AuthenticatedRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// GET /api/posts - Public search, category filter, pagination
router.get('/', async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(20, Math.max(1, parseInt(req.query.limit as string) || 10));
  const search = req.query.search as string;
  const category = req.query.category as string;

  const whereClause: any = {
    status: PostStatus.PUBLISHED,
  };

  if (search) {
    whereClause.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { body: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (category) {
    whereClause.categories = {
      some: { category: { slug: category } },
    };
  }

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where: whereClause,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { name: true, avatarUrl: true } },
        categories: { include: { category: true } },
        tags: { include: { tag: true } },
      },
    }),
    prisma.post.count({ where: whereClause }),
  ]);

  res.json({
    posts,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

// GET /api/posts/:slug - Read a single post
router.get('/:slug', async (req, res) => {
  const post = await prisma.post.findUnique({
    where: { slug: req.params.slug },
    include: {
      author: { select: { id: true, name: true, avatarUrl: true } },
      categories: { include: { category: true } },
      tags: { include: { tag: true } },
      comments: {
        include: { user: { select: { name: true, avatarUrl: true } } },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!post || post.status === PostStatus.HIDDEN) {
    return res.status(404).json({ error: 'Post not found' });
  }

  res.json({ post });
});

// POST /api/posts - Author creates a post
router.post('/', authenticate, requireRole([Role.AUTHOR, Role.MODERATOR]), async (req: AuthenticatedRequest, res) => {
  const { title, body, status, categoryIds = [], tagIds = [] } = req.body;

  if (!title || !body) {
    return res.status(400).json({ error: 'Title and body are required' });
  }

  // Generate basic unique slug
  const baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  const slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

  try {
    const post = await prisma.post.create({
      data: {
        title,
        slug,
        body,
        status: status || PostStatus.DRAFT,
        authorId: req.user!.userId,
        categories: {
          create: categoryIds.map((id: string) => ({ categoryId: id })),
        },
        tags: {
          create: tagIds.map((id: string) => ({ tagId: id })),
        },
      },
      include: {
        categories: { include: { category: true } },
        tags: { include: { tag: true } },
      },
    });

    res.status(201).json({ post });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

export default router;