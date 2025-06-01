import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { NotificationEntity } from './types/notification.types';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private userSockets: Map<number, string[]> = new Map();

  handleConnection(client: Socket): void {
    console.log(`Client connected: ${client.id}`);
  }

  @SubscribeMessage('join')
  handleJoinRoom(
    client: Socket,
    userId: number,
  ): { status: string; message: string } {
    this.handleUserConnection(userId, client.id);
    return { status: 'ok', message: 'Joined successfully' };
  }

  handleDisconnect(client: Socket): void {
    console.log(`Client disconnected: ${client.id}`);
    this.removeSocket(client.id);
  }

  private removeSocket(socketId: string): void {
    this.userSockets.forEach((sockets, userId) => {
      const index = sockets.indexOf(socketId);
      if (index !== -1) {
        sockets.splice(index, 1);
        if (sockets.length === 0) {
          this.userSockets.delete(userId);
        }
      }
    });
  }

  handleUserConnection(userId: number, socketId: string): void {
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, []);
    }
    const sockets = this.userSockets.get(userId);
    if (sockets && !sockets.includes(socketId)) {
      sockets.push(socketId);
    }
  }

  sendNotificationToUser(
    userId: number,
    notification: NotificationEntity,
  ): void {
    const userSocketIds = this.userSockets.get(userId);
    if (userSocketIds?.length) {
      userSocketIds.forEach((socketId) => {
        this.server.to(socketId).emit('notification', notification);
      });
    }
  }
}
