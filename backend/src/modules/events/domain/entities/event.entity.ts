import { EventValidationError } from '../errors/event-validation.error';
import { Tag, type TagPrimitives } from './tag.entity';
import { type EventStatus, isEventStatus } from './event-status';

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

  withStatus(status: EventStatus): Event {
    if (!isEventStatus(status)) {
      throw new EventValidationError('Estado inválido', ['status']);
    }

    return new Event({
      ...this.props,
      status,
    });
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
