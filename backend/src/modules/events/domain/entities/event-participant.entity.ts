import { EventParticipantValidationError } from '../errors/event-participant-validation.error';

export type EventParticipantPrimitives = {
  id?: string;
  eventId: string;
  email: string;
  displayName?: string | null;
  userId?: string | null;
  joinedAt?: Date;
  revokedAt?: Date | null;
};

export type CreateEventParticipantProps = {
  eventId: string;
  email: string;
  displayName?: string | null;
  userId?: string | null;
};

export class EventParticipant {
  private constructor(private readonly props: EventParticipantPrimitives) {}

  get id() {
    return this.props.id;
  }

  get eventId() {
    return this.props.eventId;
  }

  get email() {
    return this.props.email;
  }

  static create(props: CreateEventParticipantProps): EventParticipant {
    EventParticipant.assertValid(props);

    return new EventParticipant({
      eventId: props.eventId,
      email: EventParticipant.normalizeEmail(props.email),
      displayName: props.displayName?.trim() || null,
      userId: props.userId || null,
    });
  }

  static rehydrate(props: EventParticipantPrimitives): EventParticipant {
    return new EventParticipant({
      ...props,
      email: EventParticipant.normalizeEmail(props.email),
    });
  }

  reactivate(): EventParticipant {
    return new EventParticipant({
      ...this.props,
      revokedAt: null,
      joinedAt: this.props.joinedAt ?? new Date(),
    });
  }

  revoke(revokedAt: Date): EventParticipant {
    return new EventParticipant({
      ...this.props,
      revokedAt,
    });
  }

  toPrimitives(): EventParticipantPrimitives {
    return { ...this.props };
  }

  static normalizeEmail(email: string) {
    return email.trim().toLowerCase();
  }

  private static assertValid(props: CreateEventParticipantProps) {
    if (!props.eventId?.trim()) {
      throw new EventParticipantValidationError('Evento inválido', ['eventId']);
    }

    const email = EventParticipant.normalizeEmail(props.email);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new EventParticipantValidationError('Email inválido', ['email']);
    }
  }
}
