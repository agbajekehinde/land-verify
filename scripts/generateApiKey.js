const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

async function main() {
  const name = process.argv[2] || 'Unnamed Client';
  const key = crypto.randomBytes(32).toString('hex');

  const apiKey = await prisma.apiKey.create({
    data: {
      key,
      name,
      active: true,
    },
  });

  console.log('API Key created for', name);
  console.log('API Key:', apiKey.key);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 

  //node scripts/generateApiKey.js "Client Name"
  //API Key created for Acme Corporation
//API Key: f48d44b633fb1b87aee8467dd8543a44e1ef1d2bb9ed643f2204c5a6b923264c