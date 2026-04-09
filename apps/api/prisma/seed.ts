import { PrismaClient, Role, PaymentMethod, AttendanceStatus, GroupStatus, DayType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// ── Helpers ──
const rnd = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = <T>(arr: T[]): T => arr[rnd(0, arr.length - 1)];
const shuffle = <T>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);

function dateAgo(daysAgo: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(rnd(8, 18), rnd(0, 59), 0, 0);
  return d;
}
function dateOnly(daysAgo: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(0, 0, 0, 0);
  return d;
}
function monthStr(monthsAgo: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() - monthsAgo);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

// ── Data pools ──
const BRANCH_DATA = [
  { name: 'Chilonzor filiali', address: 'Toshkent sh., Chilonzor tumani, 9-kvartal', phone: '+998901111111' },
  { name: 'Yunusobod filiali', address: 'Toshkent sh., Yunusobod tumani, 4-kvartal', phone: '+998902222222' },
  { name: 'Sergeli filiali', address: 'Toshkent sh., Sergeli tumani, 7A-dom', phone: '+998903333333' },
  { name: 'Mirzo Ulug\'bek filiali', address: 'Toshkent sh., Mirzo Ulug\'bek tumani', phone: '+998904444444' },
  { name: 'Olmazor filiali', address: 'Toshkent sh., Olmazor tumani, Navoiy ko\'chasi', phone: '+998905555555' },
];

const COURSES = [
  { name: 'English', price: 500000, duration: 3, lessonDuration: 90 },
  { name: 'Matematika', price: 400000, duration: 6, lessonDuration: 90 },
  { name: 'Rus tili', price: 450000, duration: 4, lessonDuration: 80 },
  { name: 'IT / Dasturlash', price: 700000, duration: 6, lessonDuration: 120 },
  { name: 'Arabcha', price: 350000, duration: 4, lessonDuration: 80 },
  { name: 'Koreys tili', price: 550000, duration: 5, lessonDuration: 90 },
  { name: 'IELTS Preparation', price: 800000, duration: 4, lessonDuration: 120 },
  { name: 'Mental Arifmetika', price: 300000, duration: 12, lessonDuration: 60 },
];

const FIRST_NAMES_M = ['Jasur', 'Sardor', 'Bekzod', 'Otabek', 'Sherzod', 'Asilbek', 'Nodir', 'Umid', 'Davron', 'Behruz', 'Firdavs', 'Oybek', 'Eldor', 'Jamshid', 'Ravshan', 'Alisher', 'Bobur', 'Temur', 'Farrux', 'Islom'];
const FIRST_NAMES_F = ['Madina', 'Zilola', 'Dilnoza', 'Shahlo', 'Kamola', 'Nigora', 'Dilorom', 'Gulnora', 'Nasiba', 'Malika', 'Sevara', 'Zulfiya', 'Barno', 'Mohira', 'Ozoda', 'Iroda', 'Robiya', 'Feruza', 'Hulkar', 'Sabohat'];
const LAST_NAMES = ['Karimov', 'Rahimov', 'Toshmatov', 'Ergashev', 'Mirzayev', 'Xolmatov', 'Umarov', 'Abdullayev', 'Yusupov', 'Sobirov', 'Nazarov', 'Ismoilov', 'Qodirov', 'Botirov', 'Raxmatullayev', 'Turgunov', 'Normatov', 'Jurayev', 'Xasanov', 'Sharipov'];
const LEAD_SOURCES = ['Instagram', 'Telegram', 'Do\'stlar', 'Sayt', 'Facebook', 'Reklama banner', 'YouTube', 'Boshqa'];
const EXPENSE_CATS = ['Ijara', 'Kommunal', 'Marketing', 'Internet', 'Ta\'mirlash', 'Ofis jihozlari', 'Transport', 'Boshqa'];
const PROBLEM_TYPES = ['equipment', 'facility', 'staff', 'student', 'finance', 'other'];
const PROBLEM_ISSUES = [
  'Proyektor ishlamayapti', 'Konditsioner buzilgan', 'Wi-Fi sekin ishlayapti',
  'Doskaga marker kerak', 'O\'quvchi shikoyat qildi', 'To\'lov kechiktirilgan',
  'Stul singan', 'Chiroq yonmayapti', 'Suv oqyapti', 'Eshik buzilgan',
  'O\'qituvchi kech keldi', 'Kitoblar yetishmayapti', 'Kompyuter ishlamayapti',
];

const ROOM_NAMES = ['A-101', 'A-102', 'A-103', 'B-201', 'B-202', 'B-203', 'C-301', 'C-302'];

let phoneCounter = 100;
function nextPhone(): string {
  phoneCounter++;
  return `+99890${String(phoneCounter).padStart(7, '0')}`;
}

async function main() {
  console.log('Clearing existing data...');
  // Delete in dependency order
  await prisma.attendance.deleteMany();
  await prisma.teacherAttendance.deleteMany();
  await prisma.gradeRecord.deleteMany();
  await prisma.examResult.deleteMany();
  await prisma.exam.deleteMany();
  await prisma.groupStudent.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.withdrawal.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.salary.deleteMany();
  await prisma.rating.deleteMany();
  await prisma.order.deleteMany();
  await prisma.smsRecord.deleteMany();
  await prisma.callRecord.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.reminder.deleteMany();
  await prisma.leadTag.deleteMany();
  await prisma.groupTag.deleteMany();
  await prisma.onlineLesson.deleteMany();
  await prisma.discount.deleteMany();
  await prisma.emptyRoom.deleteMany();
  await prisma.problem.deleteMany();
  await prisma.dailyReport.deleteMany();
  await prisma.aiInsight.deleteMany();
  await prisma.kpiTarget.deleteMany();
  await prisma.kpiAssignment.deleteMany();
  await prisma.hrGoal.deleteMany();
  await prisma.hrStaff.deleteMany();
  await prisma.workSchedule.deleteMany();
  await prisma.log.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.group.deleteMany();
  await prisma.student.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.leadStage.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.userBranch.deleteMany();
  await prisma.financeCategory.deleteMany();
  await prisma.room.deleteMany();
  await prisma.course.deleteMany();
  await prisma.product.deleteMany();
  await prisma.form.deleteMany();
  await prisma.blogPost.deleteMany();
  await prisma.branchConfig.deleteMany();
  await prisma.holiday.deleteMany();
  await prisma.smsSettings.deleteMany();
  await prisma.voipSettings.deleteMany();
  await prisma.user.deleteMany();
  await prisma.cronJob.deleteMany();
  await prisma.branch.deleteMany();
  console.log('Cleared.');

  const hashedPwd = await bcrypt.hash('admin123', 10);

  // ═══════════════════════════════════════════
  // CEO USER
  // ═══════════════════════════════════════════
  const ceo = await prisma.user.create({
    data: { firstName: 'Admin', lastName: 'CEO', phone: '+998900000000', password: hashedPwd, role: 'CEO' },
  });
  console.log('CEO created:', ceo.id);

  // ═══════════════════════════════════════════
  // 5 BRANCHES
  // ═══════════════════════════════════════════
  const branchIds: number[] = [];
  const branchMap: Record<number, typeof BRANCH_DATA[0]> = {};

  for (const bd of BRANCH_DATA) {
    const b = await prisma.branch.create({ data: bd });
    branchIds.push(b.id);
    branchMap[b.id] = bd;

    // Link CEO to every branch
    await prisma.userBranch.create({ data: { userId: ceo.id, branchId: b.id } });

    // Finance categories
    await prisma.financeCategory.createMany({
      data: [
        { branchId: b.id, key: 'cash', label: 'Naqd', color: '#06b6d4', sortOrder: 0 },
        { branchId: b.id, key: 'bank', label: 'Bank', color: '#8b5cf6', sortOrder: 1 },
      ],
    });

    // Lead stages (Modme-style configurable)
    await prisma.leadStage.createMany({
      data: [
        { branchId: b.id, key: 'lead', label: 'Leads', color: '#1890ff', sortOrder: 0 },
        { branchId: b.id, key: 'sinov_darsiga_chaqirildi', label: 'Sinov darsiga chaqirildi', color: '#722ed1', sortOrder: 1 },
        { branchId: b.id, key: 'sifatli', label: 'Sifatli', color: '#13c2c2', sortOrder: 2 },
        { branchId: b.id, key: 'telefon_kotarmadi', label: "Telefon ko'tarmadi", color: '#fa8c16', sortOrder: 3 },
        { branchId: b.id, key: 'rad_etildi', label: 'Rad etildi', color: '#f5222d', sortOrder: 4 },
      ],
    });
  }
  console.log('5 branches created');

  // Cron jobs
  await prisma.cronJob.createMany({
    data: [
      { key: 'daily_report', label: 'Kunlik hisobot', schedule: '0 9 * * *', type: 'report', sections: 'leads,finance,attendance,debtors' },
      { key: 'weekly_report', label: 'Haftalik hisobot', schedule: '0 9 * * 1', type: 'report', sections: 'leads,finance,attendance,debtors,problems' },
      { key: 'monthly_report', label: 'Oylik hisobot', schedule: '0 9 1 * *', type: 'report', sections: 'leads,finance,attendance,debtors,problems,rejections' },
      { key: 'daily_reminder', label: 'Kunlik eslatma', schedule: '0 18 * * 1-6', type: 'message', message: "Bugungi ma'lumotlarni kiritishni unutmang!" },
    ],
  });

  // ═══════════════════════════════════════════
  // PER-BRANCH DATA
  // ═══════════════════════════════════════════
  for (const branchId of branchIds) {
    const bn = branchMap[branchId].name;
    console.log(`\n── Seeding ${bn} ──`);

    // ── MANAGER ──
    const manager = await prisma.user.create({
      data: { firstName: pick(FIRST_NAMES_M), lastName: pick(LAST_NAMES), phone: nextPhone(), password: hashedPwd, role: 'MANAGER' },
    });
    await prisma.userBranch.create({ data: { userId: manager.id, branchId } });

    // ── ROOMS (4-6) ──
    const roomCount = rnd(4, 6);
    const roomNames = shuffle(ROOM_NAMES).slice(0, roomCount);
    const rooms: { id: number; capacity: number }[] = [];
    for (const rn of roomNames) {
      const r = await prisma.room.create({ data: { branchId, name: rn, capacity: rnd(12, 25) } });
      rooms.push({ id: r.id, capacity: r.capacity || 20 });
    }

    // ── COURSES (4-6) ──
    const courseCount = rnd(4, 6);
    const branchCourses = shuffle(COURSES).slice(0, courseCount);
    const courseIds: { id: number; name: string; price: number }[] = [];
    for (const cd of branchCourses) {
      const c = await prisma.course.create({
        data: { branchId, name: cd.name, price: cd.price, duration: cd.duration, lessonDuration: cd.lessonDuration },
      });
      courseIds.push({ id: c.id, name: c.name, price: cd.price });
    }

    // ── TEACHERS (3-5) ──
    const teacherCount = rnd(3, 5);
    const teacherIds: number[] = [];
    for (let t = 0; t < teacherCount; t++) {
      const isFemale = Math.random() > 0.5;
      const u = await prisma.user.create({
        data: {
          firstName: pick(isFemale ? FIRST_NAMES_F : FIRST_NAMES_M),
          lastName: pick(LAST_NAMES),
          phone: nextPhone(),
          password: hashedPwd,
          role: 'TEACHER',
          gender: isFemale ? 'female' : 'male',
        },
      });
      await prisma.userBranch.create({ data: { userId: u.id, branchId } });
      const salaryType = Math.random() > 0.5 ? 'percentage' : 'fixed';
      const salaryAmount = salaryType === 'percentage' ? pick([40, 45, 50, 55]) : pick([150000, 175000, 200000, 250000]);
      const teacher = await prisma.teacher.create({ data: { userId: u.id, salaryType, salaryAmount } });
      teacherIds.push(teacher.id);

      // HR staff
      await prisma.hrStaff.create({
        data: {
          branchId, name: `${u.firstName} ${u.lastName}`, phone: u.phone,
          category: 'teacher', position: "O'qituvchi", subject: courseIds[t % courseIds.length]?.name,
          startDate: dateAgo(rnd(90, 365)), status: 'ACTIVE',
        },
      });
    }

    // ── GROUPS (6-10) ──
    const groupCount = rnd(6, 10);
    const groupIds: { id: number; courseId: number; price: number }[] = [];
    const times = ['09:00', '10:30', '13:00', '14:30', '16:00', '17:30', '19:00'];
    for (let g = 0; g < groupCount; g++) {
      const course = courseIds[g % courseIds.length];
      const teacher = teacherIds[g % teacherIds.length];
      const room = rooms[g % rooms.length];
      const st = times[g % times.length];
      const grp = await prisma.group.create({
        data: {
          branchId, name: `${course.name}-${g + 1}`, courseId: course.id,
          teacherId: teacher, roomId: room.id,
          dayType: g % 2 === 0 ? 'ODD' : 'EVEN',
          startTime: st, endTime: `${parseInt(st) + 1}:30`,
          startDate: dateAgo(rnd(60, 180)),
          capacity: room.capacity, status: 'ACTIVE',
        },
      });
      groupIds.push({ id: grp.id, courseId: course.id, price: course.price });
    }
    console.log(`  ${groupCount} groups`);

    // ── STUDENTS (30-50) ──
    const studentCount = rnd(30, 50);
    const studentIds: number[] = [];
    for (let s = 0; s < studentCount; s++) {
      const isFemale = Math.random() > 0.45;
      const u = await prisma.user.create({
        data: {
          firstName: pick(isFemale ? FIRST_NAMES_F : FIRST_NAMES_M),
          lastName: pick(LAST_NAMES),
          phone: nextPhone(),
          password: hashedPwd,
          role: 'STUDENT',
          gender: isFemale ? 'female' : 'male',
          dateOfBirth: new Date(rnd(1998, 2012), rnd(0, 11), rnd(1, 28)),
        },
      });
      await prisma.userBranch.create({ data: { userId: u.id, branchId } });
      const student = await prisma.student.create({
        data: { userId: u.id, branchId, balance: rnd(-200000, 500000), coins: rnd(0, 150) },
      });
      studentIds.push(student.id);
    }
    console.log(`  ${studentCount} students`);

    // ── ENROLL students in groups ──
    for (const sid of studentIds) {
      const enrollCount = rnd(1, 2);
      const chosen = shuffle(groupIds).slice(0, enrollCount);
      for (const g of chosen) {
        try {
          await prisma.groupStudent.create({
            data: { groupId: g.id, studentId: sid, price: g.price, status: 'ACTIVE', startDate: dateAgo(rnd(30, 150)) },
          });
        } catch { /* duplicate */ }
      }
    }

    // ── LEADS (15-30) ──
    const leadCount = rnd(15, 30);
    for (let l = 0; l < leadCount; l++) {
      const isFemale = Math.random() > 0.5;
      const status = pick(['lead', 'lead', 'lead', 'sinov_darsiga_chaqirildi', 'sinov_darsiga_chaqirildi', 'sifatli', 'telefon_kotarmadi', 'rad_etildi']);
      await prisma.lead.create({
        data: {
          branchId,
          firstName: pick(isFemale ? FIRST_NAMES_F : FIRST_NAMES_M),
          lastName: pick(LAST_NAMES),
          phone: nextPhone(),
          status,
          courseId: pick(courseIds).id,
          source: pick(LEAD_SOURCES),
          createdAt: dateAgo(rnd(0, 120)),
        },
      });
    }
    console.log(`  ${leadCount} leads`);

    // ── CONVERT some leads to students (for conversion analytics) ──
    const allBranchLeads = await prisma.lead.findMany({ where: { branchId }, select: { id: true, firstName: true, lastName: true, phone: true } });
    const leadsToConvert = allBranchLeads.slice(0, rnd(3, 8)); // convert 3-8 leads
    for (const lead of leadsToConvert) {
      try {
        const u = await prisma.user.create({
          data: { firstName: lead.firstName, lastName: lead.lastName || '', phone: nextPhone(), password: hashedPwd, role: 'STUDENT' },
        });
        await prisma.userBranch.create({ data: { userId: u.id, branchId } });
        await prisma.student.create({ data: { userId: u.id, branchId, leadId: lead.id } });
      } catch { /* dup */ }
    }
    console.log(`  ${leadsToConvert.length} leads converted to students`);

    // ── PAYMENTS (spanning 6 months) ──
    const paymentCount = rnd(100, 180);
    for (let p = 0; p < paymentCount; p++) {
      const daysAgo = rnd(0, 180);
      const method: PaymentMethod = pick(['CASH', 'CASH', 'CARD', 'TRANSFER']);
      await prisma.payment.create({
        data: {
          branchId,
          studentId: pick(studentIds),
          amount: rnd(200, 900) * 1000,
          method,
          category: method === 'CASH' ? 'cash' : 'bank',
          description: "To'lov",
          createdById: manager.id,
          date: dateAgo(daysAgo),
          createdAt: dateAgo(daysAgo),
        },
      });
    }
    console.log(`  ${paymentCount} payments`);

    // ── EXPENSES (spanning 6 months) ──
    const expenseCount = rnd(30, 60);
    for (let e = 0; e < expenseCount; e++) {
      const daysAgo = rnd(0, 180);
      await prisma.expense.create({
        data: {
          branchId,
          title: pick(EXPENSE_CATS) + ' xarajati',
          amount: rnd(100, 3000) * 1000,
          category: pick(EXPENSE_CATS),
          date: dateAgo(daysAgo),
          createdAt: dateAgo(daysAgo),
        },
      });
    }
    console.log(`  ${expenseCount} expenses`);

    // ── ATTENDANCE (last 60 days) ──
    let attCount = 0;
    const enrollments = await prisma.groupStudent.findMany({ where: { group: { branchId } }, select: { groupId: true, studentId: true } });
    for (let d = 1; d <= 60; d++) {
      // ~4 days per week
      if (rnd(1, 7) > 5) continue;
      const date = dateOnly(d);
      for (const enr of enrollments) {
        // ~70% chance of record per day
        if (Math.random() > 0.3) continue;
        const status: AttendanceStatus = Math.random() < 0.78 ? 'PRESENT' : Math.random() < 0.5 ? 'ABSENT' : 'LATE';
        try {
          await prisma.attendance.create({
            data: { groupId: enr.groupId, studentId: enr.studentId, date, status },
          });
          attCount++;
        } catch { /* dup */ }
      }
    }
    console.log(`  ${attCount} attendance records`);

    // ── PROBLEMS (5-12) ──
    const problemCount = rnd(5, 12);
    for (let p = 0; p < problemCount; p++) {
      await prisma.problem.create({
        data: {
          branchId,
          type: pick(PROBLEM_TYPES),
          issue: pick(PROBLEM_ISSUES),
          status: pick(['open', 'open', 'open', 'resolved', 'in_progress']),
          reportedBy: manager.id,
          createdAt: dateAgo(rnd(0, 90)),
        },
      });
    }

    // ── EMPTY ROOMS (2-4) ──
    const emptyCount = rnd(2, 4);
    const usedRooms = shuffle(rooms).slice(0, emptyCount);
    for (const r of usedRooms) {
      await prisma.emptyRoom.create({
        data: {
          branchId,
          roomId: r.id,
          days: pick(['Dush,Chor,Jum', 'Sesh,Pay,Shan', 'Dush,Sesh,Chor', 'Pay,Jum']),
          timeSlot: pick(['09:00-11:00', '14:00-16:00', '16:00-18:00', '18:00-20:00']),
          period: pick(['Tushlikgacha', 'Tushlikdan keyin', "To'liq kun"]),
          capacity: r.capacity,
          pricePerStudent: rnd(250, 500) * 1000,
        },
      });
    }

    // ── DAILY REPORTS (last 30 days) ──
    for (let d = 0; d < 30; d++) {
      const date = dateOnly(d);
      // Leads section
      await prisma.dailyReport.create({
        data: {
          branchId, date, section: 'leads', source: 'crm-sync',
          data: { count: rnd(0, 5), subjects: courseIds.slice(0, 3).map(c => ({ name: c.name, count: rnd(0, 3) })) },
        },
      });
      // Finance section
      await prisma.dailyReport.create({
        data: {
          branchId, date, section: 'finance', source: 'crm-sync',
          data: { income: rnd(1, 8) * 1000000, expense: rnd(500, 3000) * 1000 },
        },
      });
      // Attendance section
      await prisma.dailyReport.create({
        data: {
          branchId, date, section: 'attendance', source: 'crm-sync',
          data: { expected: rnd(30, 80), attended: rnd(20, 75), rate: rnd(60, 95) },
        },
      });
      // Debtors section
      await prisma.dailyReport.create({
        data: {
          branchId, date, section: 'debtors', source: 'crm-sync',
          data: { count: rnd(2, 15), amount: rnd(500, 5000) * 1000 },
        },
      });
    }

    // ── TAGS ──
    const tagNames = ['VIP', 'Chegirma', 'Yangi', 'Test darsga keldi', 'Qayta qo\'ng\'iroq'];
    for (const tn of tagNames) {
      await prisma.tag.create({ data: { branchId, name: tn, color: pick(['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6']) } });
    }

    console.log(`  ${bn} done!`);
  }

  // ═══════════════════════════════════════════
  // SUMMARY
  // ═══════════════════════════════════════════
  const counts = {
    branches: await prisma.branch.count(),
    users: await prisma.user.count(),
    students: await prisma.student.count(),
    teachers: await prisma.teacher.count(),
    courses: await prisma.course.count(),
    groups: await prisma.group.count(),
    leads: await prisma.lead.count(),
    payments: await prisma.payment.count(),
    expenses: await prisma.expense.count(),
    attendance: await prisma.attendance.count(),
    problems: await prisma.problem.count(),
    emptyRooms: await prisma.emptyRoom.count(),
    dailyReports: await prisma.dailyReport.count(),
  };
  console.log('\n═══ SEED COMPLETE ═══');
  console.log(counts);
  console.log('\nDefault CEO user created (phone: +998900000000)');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
