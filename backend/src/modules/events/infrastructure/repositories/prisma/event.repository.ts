import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import type { Event, EventRepositoryPort } from '../../../domain';
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
}
