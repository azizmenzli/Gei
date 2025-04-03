import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const activities = await prisma.activity.findMany();
  console.log(activities);
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
