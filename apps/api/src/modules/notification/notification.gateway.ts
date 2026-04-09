import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',').map(s => s.trim()) || ['http://localhost:5173'],
    credentials: true,
  },
  namespace: '/notifications',
})
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join')
  handleJoinBranch(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { branchId: number },
  ) {
    const room = `branch-${data.branchId}`;
    client.join(room);
    this.logger.log(`Client ${client.id} joined room ${room}`);
  }

  @SubscribeMessage('leave')
  handleLeaveBranch(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { branchId: number },
  ) {
    const room = `branch-${data.branchId}`;
    client.leave(room);
    this.logger.log(`Client ${client.id} left room ${room}`);
  }

  /** Emit a new lead notification to a branch room */
  emitNewLead(branchId: number, payload: { id: number; name: string; phone?: string }) {
    this.server.to(`branch-${branchId}`).emit('newLead', {
      type: 'newLead',
      title: 'Yangi lid',
      message: `${payload.name} lid qo'shildi`,
      data: payload,
      timestamp: new Date().toISOString(),
    });
  }

  /** Emit a new payment notification to a branch room */
  emitNewPayment(branchId: number, payload: { studentName: string; amount: number }) {
    this.server.to(`branch-${branchId}`).emit('newPayment', {
      type: 'newPayment',
      title: "Yangi to'lov",
      message: `${payload.studentName} - ${new Intl.NumberFormat('uz-UZ').format(payload.amount)} so'm`,
      data: payload,
      timestamp: new Date().toISOString(),
    });
  }

  /** Emit a new problem notification to a branch room */
  emitNewProblem(branchId: number, payload: { id: number; title: string }) {
    this.server.to(`branch-${branchId}`).emit('newProblem', {
      type: 'newProblem',
      title: 'Yangi muammo',
      message: payload.title,
      data: payload,
      timestamp: new Date().toISOString(),
    });
  }
}
