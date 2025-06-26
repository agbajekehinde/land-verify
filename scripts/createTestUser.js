const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.create({
    data: {
      firstName: 'Test',
      lastName: 'User',
      email: `testuser_${Date.now()}@example.com`,
      password: 'testpassword',
      role: 'user',
    },
  });
  console.log('Created test user:', user);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
}); 