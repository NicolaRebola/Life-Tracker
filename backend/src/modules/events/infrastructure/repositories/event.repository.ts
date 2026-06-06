import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import {
  EventRepositoryPort,
  EventToCreate,
  TagToCreate,
} from '../../application/ports/outbound/event-repository.port';

@Injectable()
export class EventRepository implements EventRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async createWithTags(event: EventToCreate, tags: TagToCreate[]) {
    return this.prisma.$transaction(async (tx) => {
      const savedEvent = await tx.event.create({ data: event });

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

      return tx.event.findUnique({
        where: { id: savedEvent.id },
        include: {
          tags: {
            include: { tag: true },
          },
        },
      });
    });
  }
}
