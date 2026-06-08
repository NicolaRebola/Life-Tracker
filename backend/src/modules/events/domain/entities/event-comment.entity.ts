import { EventCommentValidationError } from '../errors/event-comment-validation.error';

export type EventCommentPrimitives = {
  id?: string;
  eventId: string;
  userId?: string | null;
  participantId?: string | null;
  body: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
};

export type CreateEventCommentProps = {
  eventId: string;
  userId?: string | null;
  participantId?: string | null;
  body: string;
};

export class EventComment {
  private constructor(private readonly props: EventCommentPrimitives) {}

  get id(): string | undefined {
    return this.props.id;
  }

  get eventId(): string {
    return this.props.eventId;
  }

  get userId(): string | null | undefined {
    return this.props.userId;
  }

  get participantId(): string | null | undefined {
    return this.props.participantId;
  }

  static create(props: CreateEventCommentProps): EventComment {
    EventComment.assertValid(props);

    return new EventComment({
      eventId: props.eventId,
      userId: props.userId ?? null,
      participantId: props.participantId ?? null,
      body: props.body.trim(),
    });
  }

  static rehydrate(props: EventCommentPrimitives): EventComment {
    return new EventComment(props);
  }

  updateBody(body: string): EventComment {
    EventComment.assertValid({
      eventId: this.props.eventId,
      userId: this.props.userId,
      participantId: this.props.participantId,
      body,
    });

    return new EventComment({
      ...this.props,
      body: body.trim(),
    });
  }

  toPrimitives(): EventCommentPrimitives {
    return { ...this.props };
  }

  private static assertValid(props: CreateEventCommentProps) {
    if (!props.eventId?.trim()) {
      throw new EventCommentValidationError('Evento inválido', ['eventId']);
    }

    const hasUser = Boolean(props.userId?.trim());
    const hasParticipant = Boolean(props.participantId?.trim());

    if (hasUser === hasParticipant) {
      throw new EventCommentValidationError('Autor inválido', [
        'userId',
        'participantId',
      ]);
    }

    if (!props.body || props.body.trim() === '') {
      throw new EventCommentValidationError(
        'El comentario no puede estar vacío',
        ['body'],
      );
    }

    if (props.body.trim().length > 5000) {
      throw new EventCommentValidationError(
        'El comentario no puede superar los 5000 caracteres',
        ['body'],
      );
    }
  }
}
