import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import type {
  EventComment,
  EventCommentRepositoryPort,
  EventCommentWithAuthor,
} from '../../../domain';
import { EventCommentPrismaMapper } from '../../mappers/prisma/event-comment-prisma.mapper';

const commentInclude = {
  user: {
    select: {
      id: true,
      displayName: true,
      email: true,
    },
  },
} as const;

@Injectable()
export class PrismaEventCommentRepository implements EventCommentRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async save(comment: EventComment): Promise<EventCommentWithAuthor> {
    const data = EventCommentPrismaMapper.toPersistence(comment);

    const row = await this.prisma.eventComment.create({
      data,
      include: commentInclude,
    });

    return EventCommentPrismaMapper.toWithAuthor(row);
  }

  async findManyByEventForUser(
    userId: string,
    eventId: string,
  ): Promise<EventCommentWithAuthor[]> {
    const rows = await this.prisma.eventComment.findMany({
      where: {
        eventId,
        deletedAt: null,
        event: {
          userId,
          deletedAt: null,
        },
      },
      include: commentInclude,
      orderBy: { createdAt: 'asc' },
    });

    return rows.map((row) => EventCommentPrismaMapper.toWithAuthor(row));
  }

  async findByIdForUser(
    userId: string,
    eventId: string,
    commentId: string,
  ): Promise<EventCommentWithAuthor | null> {
    const row = await this.prisma.eventComment.findFirst({
      where: {
        id: commentId,
        eventId,
        deletedAt: null,
        event: {
          userId,
          deletedAt: null,
        },
      },
      include: commentInclude,
    });

    if (!row) {
      return null;
    }

    return EventCommentPrismaMapper.toWithAuthor(row);
  }

  async update(comment: EventComment): Promise<EventCommentWithAuthor> {
    const props = comment.toPrimitives();

    if (!props.id) {
      throw new Error('Cannot update a comment without id');
    }

    const row = await this.prisma.eventComment.update({
      where: { id: props.id },
      data: {
        body: props.body,
      },
      include: commentInclude,
    });

    return EventCommentPrismaMapper.toWithAuthor(row);
  }

  async softDelete(
    userId: string,
    eventId: string,
    commentId: string,
    deletedAt: Date,
  ): Promise<boolean> {
    const { count } = await this.prisma.eventComment.updateMany({
      where: {
        id: commentId,
        eventId,
        userId,
        deletedAt: null,
        event: {
          userId,
          deletedAt: null,
        },
      },
      data: { deletedAt },
    });

    return count > 0;
  }

  async countByEventIds(eventIds: string[]): Promise<Record<string, number>> {
    if (eventIds.length === 0) {
      return {};
    }

    const rows = await this.prisma.eventComment.groupBy({
      by: ['eventId'],
      where: {
        eventId: { in: eventIds },
        deletedAt: null,
      },
      _count: {
        _all: true,
      },
    });

    return rows.reduce<Record<string, number>>((acc, row) => {
      acc[row.eventId] = row._count._all;
      return acc;
    }, {});
  }
}
