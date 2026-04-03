import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // 1. Create default branch
  const branch = await prisma.branch.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Main Branch',
      address: 'Tashkent',
      phone: '+998901234567',
    },
  });
  console.log('Branch created:', branch.name);

  // 2. Create CEO user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const ceoUser = await prisma.user.upsert({
    where: { phone: '+998900000000' },
    update: {},
    create: {
      firstName: 'Admin',
      lastName: 'CEO',
      phone: '+998900000000',
      password: hashedPassword,
      role: 'CEO',
    },
  });
  console.log('CEO user created:', ceoUser.firstName, ceoUser.lastName);

  // 3. Link CEO to branch via UserBranch
  await prisma.userBranch.upsert({
    where: {
      userId_branchId: {
        userId: ceoUser.id,
        branchId: branch.id,
      },
    },
    update: {},
    create: {
      userId: ceoUser.id,
      branchId: branch.id,
    },
  });
  console.log('CEO linked to branch');

  // 4. Create sample rooms
  const room1 = await prisma.room.upsert({
    where: { id: 1 },
    update: {},
    create: {
      branchId: branch.id,
      name: 'Room 1',
      capacity: 20,
    },
  });

  const room2 = await prisma.room.upsert({
    where: { id: 2 },
    update: {},
    create: {
      branchId: branch.id,
      name: 'Room 2',
      capacity: 15,
    },
  });
  console.log('Rooms created:', room1.name, room2.name);

  // 5. Create sample course
  const course = await prisma.course.upsert({
    where: { id: 1 },
    update: {},
    create: {
      branchId: branch.id,
      name: 'English',
      price: 500000,
    },
  });
  console.log('Course created:', course.name);

  // 6. Create default finance categories (dual accounting)
  const cashCat = await prisma.financeCategory.upsert({
    where: { branchId_key: { branchId: branch.id, key: 'cash' } },
    update: {},
    create: {
      branchId: branch.id,
      key: 'cash',
      label: 'Naqd',
      color: '#06b6d4',
      sortOrder: 0,
    },
  });
  const bankCat = await prisma.financeCategory.upsert({
    where: { branchId_key: { branchId: branch.id, key: 'bank' } },
    update: {},
    create: {
      branchId: branch.id,
      key: 'bank',
      label: 'Bank',
      color: '#8b5cf6',
      sortOrder: 1,
    },
  });
  console.log('Finance categories created:', cashCat.label, bankCat.label);

  // 7. Create default cron jobs
  const cronJobs = [
    {
      key: 'daily_report',
      label: 'Kunlik hisobot',
      schedule: '0 9 * * *',
      type: 'report',
      sections: 'leads,finance,attendance,debtors',
    },
    {
      key: 'weekly_report',
      label: 'Haftalik hisobot',
      schedule: '0 9 * * 1',
      type: 'report',
      sections: 'leads,finance,attendance,debtors,problems',
    },
    {
      key: 'monthly_report',
      label: 'Oylik hisobot',
      schedule: '0 9 1 * *',
      type: 'report',
      sections: 'leads,finance,attendance,debtors,problems,rejections',
    },
    {
      key: 'daily_reminder',
      label: 'Kunlik eslatma',
      schedule: '0 18 * * 1-6',
      type: 'message',
      message: 'Bugungi ma\'lumotlarni kiritishni unutmang!',
    },
  ];

  for (const job of cronJobs) {
    await prisma.cronJob.upsert({
      where: { key: job.key },
      update: {},
      create: job,
    });
  }
  console.log('Cron jobs created:', cronJobs.length);

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
