import { EventStatusTransitionError } from '../errors/event-status-transition.error';
import { EventValidationError } from '../errors/event-validation.error';
import { Tag, type TagPrimitives } from './tag.entity';
import {
  canTransitionEventStatus,
  type EventStatus,
  isEventStatus,
} from './event-status';
import type { EventStatusTransition } from './event-status-transition';

export type EventPrimitives = {
  id?: string;
  userId: string;
  name: string;
  description: string;
  notes: string;
  fromDateTime: Date;
  toDateTime: Date;
  status: EventStatus;
  tags: TagPrimitives[];
};

export type CreateEventProps = {
  userId: string;
  name: string;
  description?: string;
  notes?: string;
  fromDateTime: Date;
  toDateTime: Date;
  tags?: Tag[];
  status?: EventStatus;
};

export class Event {
  private constructor(private readonly props: EventPrimitives) {}

  get id(): string | undefined {
    return this.props.id;
  }

  get status(): EventStatus {
    return this.props.status;
  }

  static create(props: CreateEventProps): Event {
    Event.assertValid(props);

    return new Event({
      userId: props.userId,
      name: props.name.trim(),
      description: props.description?.trim() ?? '',
      notes: props.notes?.trim() ?? '',
      fromDateTime: props.fromDateTime,
      toDateTime: props.toDateTime,
      status: props.status ?? 'TODO',
      tags: props.tags?.map((tag) => tag.toPrimitives()) ?? [],
    });
  }

  static rehydrate(props: EventPrimitives): Event {
    return new Event(props);
  }

  transitionTo(status: EventStatus): {
    event: Event;
    transition: EventStatusTransition;
  } {
    if (!isEventStatus(status)) {
      throw new EventValidationError('Estado inválido', ['status']);
    }

    if (!this.props.id) {
      throw new EventValidationError('Evento inválido', ['eventId']);
    }

    const occurredAt = new Date();
    const fromStatus = this.props.status;

    if (fromStatus === status) {
      return {
        event: this,
        transition: {
          eventId: this.props.id,
          fromStatus,
          toStatus: status,
          occurredAt,
          changed: false,
        },
      };
    }

    if (!canTransitionEventStatus(fromStatus, status)) {
      throw new EventStatusTransitionError(
        `No se puede transicionar de ${fromStatus} a ${status}`,
        fromStatus,
        status,
      );
    }

    return {
      event: new Event({
        ...this.props,
        status,
      }),
      transition: {
        eventId: this.props.id,
        fromStatus,
        toStatus: status,
        occurredAt,
        changed: true,
      },
    };
  }

  toPrimitives(): EventPrimitives {
    return {
      ...this.props,
      tags: this.props.tags.map((tag) => ({ ...tag })),
    };
  }

  private static assertValid(props: CreateEventProps) {
    if (!props.userId)
      throw new EventValidationError('Usuario no identificado', ['userId']);

    if (!props.name || props.name.trim() === '')
      throw new EventValidationError('El nombre es requerido', ['name']);

    if (Number.isNaN(props.fromDateTime.getTime()))
      throw new EventValidationError('Fecha inválida', ['fromDateTime']);

    if (Number.isNaN(props.toDateTime.getTime()))
      throw new EventValidationError('Fecha inválida', ['toDateTime']);

    if (props.fromDateTime > props.toDateTime) {
      throw new EventValidationError(
        'La fecha de inicio debe ser anterior a la fecha de fin',
        ['fromDateTime', 'toDateTime'],
      );
    }

    if (props.status && !isEventStatus(props.status)) {
      throw new EventValidationError('Estado inválido', ['status']);
    }
  }
}
