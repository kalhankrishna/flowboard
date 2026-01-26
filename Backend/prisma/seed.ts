import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/lib/auth.js';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');
  
  // Create test user
  console.log('Creating test user...');
  const testUser = await prisma.user.create({
    data: {
      email: 'test@example.com',
      password: await hashPassword('testpassword123'),
      name: 'Test User',
    },
  });

  console.log(`Created test user: ${testUser.email}`);

  // Create board with BoardAccess entry (using transaction)
  console.log('Creating board with owner access...');
  const board = await prisma.$transaction(async (tx) => {
    // Create the board
    const newBoard = await tx.board.create({
      data: {
        name: 'My Kanban Board',
        ownerId: testUser.id,
      },
    });

    // Create BoardAccess entry for owner
    await tx.boardAccess.create({
      data: {
        boardId: newBoard.id,
        userId: testUser.id,
        role: 'OWNER',
      },
    });

    return newBoard;
  });

  console.log(`Created board with OWNER access entry`);

  // Create columns
  console.log('Creating columns...');
  const todoColumn = await prisma.column.create({
    data: {
      boardId: board.id,
      title: 'To Do',
      position: 0,
      version: 1,
    },
  });

  const inProgressColumn = await prisma.column.create({
    data: {
      boardId: board.id,
      title: 'In Progress',
      position: 1,
      version: 1,
    },
  });

  const doneColumn = await prisma.column.create({
    data: {
      boardId: board.id,
      title: 'Done',
      position: 2,
      version: 1,
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
        version: 1,
      },
      {
        columnId: todoColumn.id,
        title: 'Setup database',
        description: 'Configure PostgreSQL and migrations',
        position: 1,
        version: 1,
      },
      {
        columnId: todoColumn.id,
        title: 'Write API documentation',
        description: 'Document all REST endpoints',
        position: 2,
        version: 1,
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
        version: 1,
      },
      {
        columnId: inProgressColumn.id,
        title: 'Add drag & drop',
        description: 'Integrate dnd-kit library',
        position: 1,
        version: 1,
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
        version: 1,
      },
      {
        columnId: doneColumn.id,
        title: 'Configure Prisma',
        description: 'Setup ORM and run migrations',
        position: 1,
        version: 1,
      },
    ],
  });

  console.log('Database seeded successfully!');
  console.log(`Created: 1 user, 1 board, 1 board access entry, 3 columns, 7 cards`);
  console.log('\nTest credentials:');
  console.log('  Email: test@example.com');
  console.log('  Password: testpassword123');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });