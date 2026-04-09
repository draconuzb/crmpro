import { Test, TestingModule } from '@nestjs/testing';
import { AttendanceService } from './attendance.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrisma = {
  attendance: {
    upsert: jest.fn(),
    findMany: jest.fn(),
    groupBy: jest.fn(),
    count: jest.fn(),
  },
  teacherAttendance: {
    upsert: jest.fn(),
    findMany: jest.fn(),
  },
  workSchedule: {
    findMany: jest.fn(),
  },
  groupStudent: {
    findMany: jest.fn(),
  },
  group: {
    findMany: jest.fn(),
  },
  $transaction: jest.fn((fn: any) => fn(mockPrisma)),
};

describe('AttendanceService', () => {
  let service: AttendanceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttendanceService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<AttendanceService>(AttendanceService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('bulkMark', () => {
    it('should mark attendance for multiple students', async () => {
      const dto = {
        groupId: 1,
        date: '2026-04-09',
        records: [
          { studentId: 1, status: 'PRESENT' as const },
          { studentId: 2, status: 'ABSENT' as const },
          { studentId: 3, status: 'LATE' as const },
        ],
      };

      mockPrisma.attendance.upsert.mockResolvedValue({ id: 1 });

      const result = await service.bulkMark(dto);

      expect(mockPrisma.attendance.upsert).toHaveBeenCalledTimes(3);
      expect(result).toBeDefined();
    });

    it('should handle empty records array', async () => {
      const dto = { groupId: 1, date: '2026-04-09', records: [] };

      const result = await service.bulkMark(dto);

      expect(mockPrisma.attendance.upsert).not.toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should use upsert to prevent duplicate entries', async () => {
      const dto = {
        groupId: 1,
        date: '2026-04-09',
        records: [{ studentId: 1, status: 'PRESENT' as const }],
      };

      mockPrisma.attendance.upsert.mockResolvedValue({ id: 1 });

      await service.bulkMark(dto);

      const upsertCall = mockPrisma.attendance.upsert.mock.calls[0][0];
      expect(upsertCall.where.groupId_studentId_date).toBeDefined();
      expect(upsertCall.create.status).toBe('PRESENT');
      expect(upsertCall.update.status).toBe('PRESENT');
    });
  });

  describe('getReport', () => {
    it('should return attendance report for a branch', async () => {
      mockPrisma.group.findMany.mockResolvedValue([
        {
          id: 1,
          name: 'English A1',
          course: { name: 'English' },
          teacher: { user: { firstName: 'Ali', lastName: 'T' } },
          students: [
            {
              student: {
                id: 1,
                user: { firstName: 'Jasur', lastName: 'A', phone: '+998901234567' },
                attendances: [{ status: 'PRESENT', date: new Date('2026-04-09') }],
                comments: [],
              },
            },
          ],
        },
      ]);

      const result = await service.getReport(1, { date: '2026-04-09' });

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].studentName).toBeDefined();
    });

    it('should handle empty groups', async () => {
      mockPrisma.group.findMany.mockResolvedValue([]);

      const result = await service.getReport(1, { date: '2026-04-09' });

      expect(result).toEqual([]);
    });
  });

  describe('getGroupMonthlyAttendance', () => {
    it('should return monthly attendance grid for a group', async () => {
      mockPrisma.groupStudent.findMany.mockResolvedValue([
        { student: { id: 1, user: { firstName: 'Ali', lastName: 'V' } } },
      ]);
      mockPrisma.attendance.findMany.mockResolvedValue([
        { studentId: 1, date: new Date('2026-04-01'), status: 'PRESENT' },
        { studentId: 1, date: new Date('2026-04-03'), status: 'ABSENT' },
      ]);

      const result = await service.getGroupMonthlyAttendance(1, 4, 2026);

      expect(result).toBeDefined();
      expect(result.students).toBeDefined();
      expect(result.students).toHaveLength(1);
    });
  });

  describe('markTeacherAttendance', () => {
    it('should upsert teacher attendance with check-in/out', async () => {
      const dto = {
        teacherId: 1,
        date: '2026-04-09',
        checkIn: '09:00',
        checkOut: '18:00',
        status: 'PRESENT',
      };

      mockPrisma.teacherAttendance.upsert.mockResolvedValue({ id: 1, ...dto });

      const result = await service.markTeacherAttendance(dto);

      expect(mockPrisma.teacherAttendance.upsert).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('getTeacherAttendance', () => {
    it('should return teacher attendance for a month', async () => {
      mockPrisma.teacherAttendance.findMany.mockResolvedValue([
        {
          id: 1,
          teacherId: 1,
          teacher: { user: { firstName: 'Ali', lastName: 'T' } },
          date: new Date('2026-04-01'),
          checkIn: new Date('2026-04-01T09:00:00'),
          checkOut: new Date('2026-04-01T18:00:00'),
          status: 'PRESENT',
        },
      ]);

      const result = await service.getTeacherAttendance(1, 4, 2026);

      expect(result).toBeInstanceOf(Array);
      expect(result).toHaveLength(1);
    });
  });

  describe('getStudentAttendance', () => {
    it('should return student attendance for a month', async () => {
      mockPrisma.attendance.findMany.mockResolvedValue([
        { id: 1, groupId: 1, date: new Date('2026-04-01'), status: 'PRESENT', group: { name: 'English A1' } },
        { id: 2, groupId: 1, date: new Date('2026-04-03'), status: 'ABSENT', group: { name: 'English A1' } },
      ]);

      const result = await service.getStudentAttendance(1, 4, 2026);

      expect(result).toBeInstanceOf(Array);
      expect(result).toHaveLength(2);
    });
  });
});
