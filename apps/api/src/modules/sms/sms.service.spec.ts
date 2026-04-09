import { Test, TestingModule } from '@nestjs/testing';
import { SmsService } from './sms.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrisma = {
  student: {
    findUnique: jest.fn(),
  },
  smsRecord: {
    create: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
  },
  smsSettings: {
    findUnique: jest.fn(),
  },
};

describe('SmsService', () => {
  let service: SmsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SmsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<SmsService>(SmsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendSms', () => {
    it('should create SMS record with FAILED status when Eskiz is not configured', async () => {
      mockPrisma.student.findUnique.mockResolvedValue({
        id: 1,
        branchId: 1,
        user: { phone: '+998901234567' },
        branch: { id: 1 },
      });
      mockPrisma.smsSettings.findUnique.mockResolvedValue(null);
      mockPrisma.smsRecord.create.mockResolvedValue({
        id: 1,
        studentId: 1,
        phone: '+998901234567',
        message: 'Test message',
        status: 'FAILED',
        student: { user: { id: 1, firstName: 'Ali', lastName: 'V', phone: '+998901234567' } },
      });

      const result = await service.sendSms(1, 'Test message');

      expect(result.status).toBe('FAILED');
      expect(mockPrisma.smsRecord.create).toHaveBeenCalled();
    });
  });

  describe('getHistory', () => {
    it('should return paginated SMS history', async () => {
      mockPrisma.smsRecord.findMany.mockResolvedValue([
        { id: 1, phone: '+998901234567', message: 'Hello', status: 'SENT' },
      ]);
      mockPrisma.smsRecord.count.mockResolvedValue(1);

      const result = await service.getHistory(1, { page: 1, limit: 20 });

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('bulkSend', () => {
    it('should send to multiple students', async () => {
      mockPrisma.student.findUnique.mockResolvedValue({
        id: 1, branchId: 1, user: { phone: '+998901234567' }, branch: { id: 1 },
      });
      mockPrisma.smsSettings.findUnique.mockResolvedValue(null);
      mockPrisma.smsRecord.create.mockResolvedValue({
        id: 1, studentId: 1, phone: '+998901234567', message: 'Bulk test', status: 'FAILED',
        student: { user: { id: 1, firstName: 'Ali', lastName: 'V', phone: '+998901234567' } },
      });

      const result = await service.bulkSend([1, 2, 3], 'Bulk test');

      expect(result.sent).toBe(3);
    });
  });
});
