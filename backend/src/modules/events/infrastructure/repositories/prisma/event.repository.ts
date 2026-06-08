import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import type {
  Event,
  EventTagSuggestion,
  EventRepositoryPort,
  ListEventsCriteria,
  PaginatedEvents,
} from '../../../domain';
import type { EventStatus } from '../../../domain/entities/event-status';
import { EventPrismaMapper } from '../../mappers/prisma/event-prisma.mapper';

@Injectable()
export class PrismaEventRepository implements EventRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async save(event: Event): Promise<Event> {
    const { event: eventData, tags } = EventPrismaMapper.toPersistence(event);

    const savedEvent = await this.prisma.$transaction(async (tx) => {
      const savedEvent = await tx.event.create({ data: eventData });
      for (const tag of tags) {
        const savedTag = await tx.tag.upsert({
          where: { name: tag.name },
          update: {},
          create: {
            name: tag.name,
            label: tag.label,
          },
        });

        await tx.eventTag.create({
          data: {
            eventId: savedEvent.id,
            tagId: savedTag.id,
          },
        });
      }

      return tx.event.findUniqueOrThrow({
        where: { id: savedEvent.id },
        include: {
          tags: {
            include: { tag: true },
          },
        },
      });
    });

    return EventPrismaMapper.toDomain(savedEvent);
  }

  async update(event: Event): Promise<Event> {
    const props = event.toPrimitives();

    if (!props.id) {
      throw new Error('Cannot update an event without id');
    }

    const { event: eventData, tags } = EventPrismaMapper.toPersistence(event);

    const updatedEvent = await this.prisma.$transaction(async (tx) => {
      const { count } = await tx.event.updateMany({
        where: {
          id: props.id,
          userId: props.userId,
          deletedAt: null,
        },
        data: {
          name: eventData.name,
          description: eventData.description,
          notes: eventData.notes,
          fromDateTime: eventData.fromDateTime,
          toDateTime: eventData.toDateTime,
        },
      });

      if (count === 0) {
        return null;
      }

      await tx.eventTag.deleteMany({
        where: { eventId: props.id },
      });

      for (const tag of tags) {
        const savedTag = await tx.tag.upsert({
          where: { name: tag.name },
          update: {},
          create: {
            name: tag.name,
            label: tag.label,
          },
        });

        await tx.eventTag.create({
          data: {
            eventId: props.id!,
            tagId: savedTag.id,
          },
        });
      }

      return tx.event.findUniqueOrThrow({
        where: { id: props.id },
        include: {
          tags: {
            include: { tag: true },
          },
        },
      });
    });

    if (!updatedEvent) {
      throw new Error('Event not found during update');
    }

    return EventPrismaMapper.toDomain(updatedEvent);
  }

  async findMany(criteria: ListEventsCriteria): Promise<PaginatedEvents> {
    const where: Prisma.EventWhereInput = {
      userId: criteria.userId,
      deletedAt: null,
      ...(criteria.name
        ? {
            name: {
              contains: criteria.name,
              mode: 'insensitive',
            },
          }
        : {}),
      ...(criteria.status ? { status: criteria.status } : {}),
      ...(criteria.tags?.length
        ? {
            tags: {
              some: {
                tag: {
                  OR: criteria.tags.flatMap((tag) => [
                    {
                      name: {
                        contains: tag,
                        mode: 'insensitive' as const,
                      },
                    },
                    {
                      label: {
                        contains: tag,
                        mode: 'insensitive' as const,
                      },
                    },
                  ]),
                },
              },
            },
          }
        : {}),
    };

    const skip = (criteria.page - 1) * criteria.limit;

    const [total, rows] = await Promise.all([
      this.prisma.event.count({ where }),
      this.prisma.event.findMany({
        where,
        include: {
          tags: {
            include: { tag: true },
          },
        },
        orderBy: { fromDateTime: 'desc' },
        skip,
        take: criteria.limit,
      }),
    ]);

    return {
      items: rows.map((row) => EventPrismaMapper.toDomain(row)),
      total,
    };
  }

  async searchTagsByName(
    userId: string,
    name: string,
    limit: number,
  ): Promise<EventTagSuggestion[]> {
    const rows = await this.prisma.tag.findMany({
      where: {
        name: {
          contains: name,
          mode: 'insensitive',
        },
        events: {
          some: {
            event: {
              userId,
              deletedAt: null,
            },
          },
        },
      },
      orderBy: { name: 'asc' },
      take: limit,
    });

    return rows.map((tag) => ({
      name: tag.name,
      label: tag.label,
    }));
  }

  async findByIdForUser(
    userId: string,
    eventId: string,
  ): Promise<Event | null> {
    const row = await this.prisma.event.findFirst({
      where: { id: eventId, userId, deletedAt: null },
      include: {
        tags: {
          include: { tag: true },
        },
      },
    });

    if (!row) {
      return null;
    }

    return EventPrismaMapper.toDomain(row);
  }

  async applyStatusTransition({
    userId,
    eventId,
    fromStatus,
    toStatus,
  }: {
    userId: string;
    eventId: string;
    fromStatus: EventStatus;
    toStatus: EventStatus;
  }): Promise<{ event: Event; applied: boolean }> {
    return this.prisma.$transaction(async (tx) => {
      const { count } = await tx.event.updateMany({
        where: {
          id: eventId,
          userId,
          status: fromStatus,
          deletedAt: null,
        },
        data: { status: toStatus },
      });

      const row = await tx.event.findFirst({
        where: { id: eventId, userId, deletedAt: null },
        include: {
          tags: {
            include: { tag: true },
          },
        },
      });

      if (!row) {
        throw new Error('Event not found after status transition attempt');
      }

      return {
        event: EventPrismaMapper.toDomain(row),
        applied: count > 0,
      };
    });
  }

  async softDelete(
    userId: string,
    eventId: string,
    deletedAt: Date,
  ): Promise<boolean> {
    const { count } = await this.prisma.event.updateMany({
      where: {
        id: eventId,
        userId,
        deletedAt: null,
      },
      data: { deletedAt },
    });

    return count > 0;
  }

  async purgeDeletedBefore(cutoff: Date): Promise<number> {
    const { count } = await this.prisma.event.deleteMany({
      where: {
        deletedAt: {
          lt: cutoff,
          not: null,
        },
      },
    });

    return count;
  }
}
