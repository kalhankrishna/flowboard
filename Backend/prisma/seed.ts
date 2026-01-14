import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Clear existing data
  console.log('Clearing existing data...');
  await prisma.card.deleteMany();
  await prisma.column.deleteMany();
  await prisma.board.deleteMany();

  // Create board
  console.log('Creating board...');
  const board = await prisma.board.create({
    data: {
      name: 'My Kanban Board',
    },
  });

  // Create columns
  console.log('Creating columns...');
  const todoColumn = await prisma.column.create({
    data: {
      boardId: board.id,
      title: 'To Do',
      position: 0,
    },
  });

  const inProgressColumn = await prisma.column.create({
    data: {
      boardId: board.id,
      title: 'In Progress',
      position: 1,
    },
  });

  const doneColumn = await prisma.column.create({
    data: {
      boardId: board.id,
      title: 'Done',
      position: 2,
    },
  });

  // Create cards
  console.log('Creating cards...');
  
  // To Do cards
  await prisma.card.createMany({
    data: [
      {
        columnId: todoColumn.id,
        title: 'Design homepage',
        description: 'Create mockups and wireframes',
        position: 0,
      },
      {
        columnId: todoColumn.id,
        title: 'Setup database',
        description: 'Configure PostgreSQL and migrations',
        position: 1,
      },
      {
        columnId: todoColumn.id,
        title: 'Write API documentation',
        description: 'Document all REST endpoints',
        position: 2,
      },
    ],
  });

  // In Progress cards
  await prisma.card.createMany({
    data: [
      {
        columnId: inProgressColumn.id,
        title: 'Build REST API',
        description: 'Implement CRUD endpoints',
        position: 0,
      },
      {
        columnId: inProgressColumn.id,
        title: 'Add drag & drop',
        description: 'Integrate dnd-kit library',
        position: 1,
      },
    ],
  });

  // Done cards
  await prisma.card.createMany({
    data: [
      {
        columnId: doneColumn.id,
        title: 'Project setup',
        description: 'Initialize Next.js and Express',
        position: 0,
      },
      {
        columnId: doneColumn.id,
        title: 'Configure Prisma',
        description: 'Setup ORM and run migrations',
        position: 1,
      },
    ],
  });

  console.log('Database seeded successfully!');
  console.log(`Created: 1 board, 3 columns, 7 cards`);
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });