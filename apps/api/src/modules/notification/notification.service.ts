import { Injectable } from '@nestjs/common';
import { NotificationGateway } from './notification.gateway';

@Injectable()
export class NotificationService {
  constructor(private readonly gateway: NotificationGateway) {}

  notifyNewLead(branchId: number, payload: { id: number; name: string; phone?: string }) {
    this.gateway.emitNewLead(branchId, payload);
  }

  notifyNewPayment(branchId: number, payload: { studentName: string; amount: number }) {
    this.gateway.emitNewPayment(branchId, payload);
  }

  notifyNewProblem(branchId: number, payload: { id: number; title: string }) {
    this.gateway.emitNewProblem(branchId, payload);
  }
}
