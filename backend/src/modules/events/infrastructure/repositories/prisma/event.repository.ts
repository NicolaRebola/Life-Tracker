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

  async findMany(criteria: ListEventsCriteria): Promise<PaginatedEvents> {
    const where: Prisma.EventWhereInput = {
      userId: criteria.userId,
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

  async updateStatus(
    userId: string,
    eventId: string,
    status: EventStatus,
  ): Promise<Event | null> {
    const existing = await this.prisma.event.findFirst({
      where: { id: eventId, userId },
    });

    if (!existing) {
      return null;
    }

    const updated = await this.prisma.event.update({
      where: { id: eventId },
      data: { status },
      include: {
        tags: {
          include: { tag: true },
        },
      },
    });

    return EventPrismaMapper.toDomain(updated);
  }
}
