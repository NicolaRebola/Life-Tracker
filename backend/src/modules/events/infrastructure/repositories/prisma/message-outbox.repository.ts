import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import type {
  EnqueueOutboxMessage,
  MessageFailureKind,
  MessageOutboxRepositoryPort,
  OutboxMessage,
} from '../../../domain';

@Injectable()
export class PrismaMessageOutboxRepository implements MessageOutboxRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async enqueue(message: EnqueueOutboxMessage): Promise<OutboxMessage> {
    const row = await this.prisma.messageOutbox.create({
      data: {
        channel: message.channel,
        messageType: message.messageType,
        payload: message.payload as Prisma.InputJsonValue,
        availableAt: message.availableAt ?? new Date(),
        maxAttempts: message.maxAttempts ?? 3,
      },
    });

    return {
      ...row,
      payload: row.payload as Record<string, unknown>,
    };
  }

  async findPendingBatch(limit: number, now: Date): Promise<OutboxMessage[]> {
    const rows = await this.prisma.messageOutbox.findMany({
      where: {
        status: 'PENDING',
        availableAt: { lte: now },
      },
      orderBy: { createdAt: 'asc' },
      take: limit,
    });

    return rows.map((row) => ({
      ...row,
      payload: row.payload as Record<string, unknown>,
    }));
  }

  async markProcessing(id: string): Promise<void> {
    await this.prisma.messageOutbox.update({
      where: { id },
      data: { status: 'PROCESSING' },
    });
  }

  async markSent(id: string, providerMessageId?: string): Promise<void> {
    await this.prisma.messageOutbox.update({
      where: { id },
      data: {
        status: 'SENT',
        providerMessageId,
        processedAt: new Date(),
      },
    });
  }

  async markFailed({
    id,
    failureKind,
    errorCode,
    message,
    nextAvailableAt,
  }: {
    id: string;
    failureKind: MessageFailureKind;
    errorCode: string;
    message: string;
    nextAvailableAt?: Date;
  }): Promise<void> {
    await this.prisma.messageOutbox.update({
      where: { id },
      data: {
        status: nextAvailableAt ? 'PENDING' : 'FAILED',
        attempts: { increment: 1 },
        failureKind,
        lastErrorCode: errorCode,
        lastError: message,
        availableAt: nextAvailableAt,
        processedAt: nextAvailableAt ? null : new Date(),
      },
    });
  }
}
