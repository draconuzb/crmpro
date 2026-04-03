/**
 * CRMPro — One-time migration script
 * Migrates data from asad-project SQLite to CRMPro PostgreSQL
 *
 * Usage:
 *   1. Copy asad-project's data/bot.db to this directory
 *   2. Set DATABASE_URL in .env
 *   3. Run: npx ts-node scripts/migrate-from-sqlite.ts
 *
 * Prerequisites:
 *   npm install better-sqlite3 @prisma/client
 */

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

// Dynamic import for better-sqlite3 (optional dependency)
let Database: any;
try {
  Database = require('better-sqlite3');
} catch {
  console.error('better-sqlite3 not installed. Run: npm install better-sqlite3');
  process.exit(1);
}

const prisma = new PrismaClient();

const SQLITE_PATH = process.argv[2] || './scripts/bot.db';

async function main() {
  console.log('══════ CRMPro Migration: SQLite → PostgreSQL ══════');
  console.log(`Source: ${SQLITE_PATH}`);

  let sqlite: any;
  try {
    sqlite = new Database(SQLITE_PATH, { readonly: true });
  } catch (e) {
    console.error(`Cannot open SQLite database at ${SQLITE_PATH}`);
    console.error('Copy asad-project bot.db here or provide path as argument');
    process.exit(1);
  }

  // Ensure default branch exists
  const branch = await prisma.branch.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, name: 'Main Branch', address: 'Tashkent' },
  });
  console.log(`✓ Branch: ${branch.name}`);

  // ─── MIGRATE USERS ──────────────────────────────────────────
  console.log('\n→ Migrating users...');
  const users = sqlite.prepare('SELECT * FROM users').all();
  let userCount = 0;

  for (const u of users) {
    const roleMap: Record<string, string> = { ceo: 'CEO', manager: 'ADMIN', user: 'MANAGER' };
    const role = roleMap[u.role] || 'MANAGER';

    try {
      const existing = await prisma.user.findUnique({ where: { phone: u.phone || `+998${u.telegram_id}` } });
      if (existing) {
        // Update telegramId
        await prisma.user.update({
          where: { id: existing.id },
          data: { telegramId: String(u.telegram_id) },
        });
      } else {
        await prisma.user.create({
          data: {
            firstName: u.name?.split(' ')[0] || 'User',
            lastName: u.name?.split(' ').slice(1).join(' ') || '',
            phone: u.phone || `+998${u.telegram_id}`,
            password: await bcrypt.hash('changeme123', 10),
            role: role as any,
            telegramId: String(u.telegram_id),
            telegramLang: u.lang || 'uz',
            botSections: u.sec_leads ? parseSections(u) : undefined,
            branches: { create: { branchId: branch.id } },
          },
        });
      }
      userCount++;
    } catch (e: any) {
      console.warn(`  Skip user ${u.name}: ${e.message}`);
    }
  }
  console.log(`✓ Users migrated: ${userCount}`);

  // ─── MIGRATE HR STAFF ───────────────────────────────────────
  console.log('\n→ Migrating HR staff...');
  try {
    const staff = sqlite.prepare('SELECT * FROM hr_staff').all();
    for (const s of staff) {
      await prisma.hrStaff.create({
        data: {
          branchId: branch.id,
          name: s.name,
          phone: s.phone,
          category: s.category,
          position: s.position,
          subject: s.subject,
          status: (s.status || 'active').toUpperCase() as any,
          notes: s.notes,
          startDate: s.start_date ? new Date(s.start_date) : undefined,
        },
      });
    }
    console.log(`✓ HR staff migrated: ${staff.length}`);
  } catch {
    console.log('  (hr_staff table not found, skipping)');
  }

  // ─── MIGRATE HR GOALS ──────────────────────────────────────
  console.log('\n→ Migrating HR goals...');
  try {
    const goals = sqlite.prepare('SELECT * FROM hr_goals').all();
    for (const g of goals) {
      await prisma.hrGoal.create({
        data: {
          branchId: branch.id,
          title: g.title,
          description: g.description,
          category: g.category,
          subject: g.subject,
          status: g.status || 'pending',
          deadline: g.deadline ? new Date(g.deadline) : undefined,
        },
      });
    }
    console.log(`✓ HR goals migrated: ${goals.length}`);
  } catch {
    console.log('  (hr_goals table not found, skipping)');
  }

  // ─── MIGRATE KPI TARGETS ───────────────────────────────────
  console.log('\n→ Migrating KPI targets...');
  try {
    const targets = sqlite.prepare('SELECT * FROM kpi_targets').all();
    for (const t of targets) {
      await prisma.kpiTarget.upsert({
        where: { branchId_metric_month: { branchId: branch.id, metric: t.metric, month: t.month } },
        update: { targetValue: t.target_value },
        create: {
          branchId: branch.id,
          metric: t.metric,
          month: t.month,
          targetValue: t.target_value,
        },
      });
    }
    console.log(`✓ KPI targets migrated: ${targets.length}`);
  } catch {
    console.log('  (kpi_targets table not found, skipping)');
  }

  // ─── MIGRATE CRON SETTINGS ─────────────────────────────────
  console.log('\n→ Migrating cron settings...');
  try {
    const crons = sqlite.prepare('SELECT * FROM cron_assignments').all();
    for (const c of crons) {
      await prisma.cronJob.upsert({
        where: { key: `migrated_${c.id}` },
        update: {},
        create: {
          key: `migrated_${c.id}`,
          label: c.label || `Cron #${c.id}`,
          schedule: c.schedule || '0 9 * * *',
          type: c.type || 'message',
          message: c.message,
          enabled: c.enabled === 1,
          branchId: branch.id,
        },
      });
    }
    console.log(`✓ Cron jobs migrated: ${crons.length}`);
  } catch {
    console.log('  (cron_assignments table not found, skipping)');
  }

  // ─── MIGRATE FINANCE CATEGORIES ────────────────────────────
  console.log('\n→ Ensuring finance categories...');
  await prisma.financeCategory.upsert({
    where: { branchId_key: { branchId: branch.id, key: 'cash' } },
    update: {},
    create: { branchId: branch.id, key: 'cash', label: 'Naqd', color: '#06b6d4', sortOrder: 0 },
  });
  await prisma.financeCategory.upsert({
    where: { branchId_key: { branchId: branch.id, key: 'bank' } },
    update: {},
    create: { branchId: branch.id, key: 'bank', label: 'Bank', color: '#8b5cf6', sortOrder: 1 },
  });
  console.log('✓ Finance categories ensured');

  // ─── MIGRATE PROBLEMS ──────────────────────────────────────
  console.log('\n→ Migrating problems...');
  try {
    const problems = sqlite.prepare('SELECT * FROM problems').all();
    for (const p of problems) {
      await prisma.problem.create({
        data: {
          branchId: branch.id,
          type: p.type || 'other',
          issue: p.issue || p.description || 'Migrated problem',
          status: p.status || 'open',
        },
      });
    }
    console.log(`✓ Problems migrated: ${problems.length}`);
  } catch {
    console.log('  (problems table not found, skipping)');
  }

  // ─── MIGRATE AUDIT LOG ─────────────────────────────────────
  console.log('\n→ Migrating audit log (last 500 entries)...');
  try {
    const logs = sqlite.prepare('SELECT * FROM audit_log ORDER BY id DESC LIMIT 500').all();
    // We need a valid userId — use first CEO
    const ceo = await prisma.user.findFirst({ where: { role: 'CEO' } });
    if (ceo) {
      for (const l of logs) {
        await prisma.log.create({
          data: {
            userId: ceo.id,
            action: l.action || 'migrated',
            entity: l.section || 'unknown',
            details: { original: l.details, timestamp: l.timestamp },
          },
        });
      }
      console.log(`✓ Audit logs migrated: ${logs.length}`);
    }
  } catch {
    console.log('  (audit_log table not found, skipping)');
  }

  console.log('\n══════ Migration complete! ══════');
  console.log('⚠ Default password for migrated users: changeme123');
  console.log('⚠ Please ask users to change their passwords');

  sqlite.close();
  await prisma.$disconnect();
}

function parseSections(user: any): string[] {
  const sections: string[] = [];
  const sectionKeys = [
    'sec_leads', 'sec_debtors', 'sec_rejections', 'sec_finance',
    'sec_attendance', 'sec_problems', 'sec_empty_rooms', 'sec_reports',
    'sec_users', 'sec_cron', 'sec_dashboard', 'sec_analysis',
  ];
  for (const key of sectionKeys) {
    if (user[key] === 1) {
      sections.push(key.replace('sec_', ''));
    }
  }
  return sections;
}

main().catch((e) => {
  console.error('Migration failed:', e);
  process.exit(1);
});
