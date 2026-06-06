import { Event } from '../../../domain/entities/event.entity';
import type { EventStatus } from '../../../domain/entities/event-status';

type PrismaEventWithTags = {
  id: string;
  userId: string;
  name: string;
  description: string;
  notes: string;
  fromDateTime: Date;
  toDateTime: Date;
  status: EventStatus;
  tags: Array<{
    tag: {
      name: string;
      label: string;
    };
  }>;
};

export class EventPrismaMapper {
  static toPersistence(event: Event) {
    const props = event.toPrimitives();

    return {
      event: {
        name: props.name,
        description: props.description,
        notes: props.notes,
        fromDateTime: props.fromDateTime,
        toDateTime: props.toDateTime,
        status: props.status,
        userId: props.userId,
      },
      tags: props.tags,
    };
  }

  static toDomain(event: PrismaEventWithTags): Event {
    return Event.rehydrate({
      id: event.id,
      userId: event.userId,
      name: event.name,
      description: event.description,
      notes: event.notes,
      fromDateTime: event.fromDateTime,
      toDateTime: event.toDateTime,
      status: event.status,
      tags: event.tags.map(({ tag }) => ({
        name: tag.name,
        label: tag.label,
      })),
    });
  }
}
