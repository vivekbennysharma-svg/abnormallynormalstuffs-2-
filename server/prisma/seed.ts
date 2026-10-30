import { PrismaClient, Role, PostStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial data...');

  // 1. Create baseline users (Author & Moderator)
  const author = await prisma.user.upsert({
    where: { email: 'author@abnormallynormal.dev' },
    update: {},
    create: {
      googleId: 'seed-google-author-001',
      email: 'author@abnormallynormal.dev',
      name: 'Dev Author',
      role: Role.AUTHOR,
    },
  });

  const moderator = await prisma.user.upsert({
    where: { email: 'moderator@abnormallynormal.dev' },
    update: {},
    create: {
      googleId: 'seed-google-mod-001',
      email: 'moderator@abnormallynormal.dev',
      name: 'Dev Moderator',
      role: Role.MODERATOR,
    },
  });

  // 2. Create Categories
  const catTech = await prisma.category.upsert({
    where: { slug: 'technology' },
    update: {},
    create: { name: 'Technology', slug: 'technology' },
  });

  const catLife = await prisma.category.upsert({
    where: { slug: 'life' },
    update: {},
    create: { name: 'Life & Musings', slug: 'life' },
  });

  // 3. Create Tags
  const tagWeb = await prisma.tag.upsert({
    where: { slug: 'web-dev' },
    update: {},
    create: { name: 'Web Dev', slug: 'web-dev' },
  });

  const tagDb = await prisma.tag.upsert({
    where: { slug: 'database' },
    update: {},
    create: { name: 'Database', slug: 'database' },
  });

  // 4. Create an Initial Post
  const samplePost = await prisma.post.upsert({
    where: { slug: 'welcome-to-abnormallynormalstuffs' },
    update: {},
    create: {
      title: 'Welcome to abnormallynormalstuffs',
      slug: 'welcome-to-abnormallynormalstuffs',
      body: 'This is the initial seeded post demonstrating relational post-category-tag architecture.',
      status: PostStatus.PUBLISHED,
      authorId: author.id,
      categories: {
        create: [{ categoryId: catTech.id }, { categoryId: catLife.id }],
      },
      tags: {
        create: [{ tagId: tagWeb.id }, { tagId: tagDb.id }],
      },
    },
  });

  console.log(`Seeding complete: Created author (${author.email}), moderator (${moderator.email}), and post: ${samplePost.title}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });