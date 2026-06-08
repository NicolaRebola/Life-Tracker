import { EventInvitationValidationError } from '../errors/event-invitation-validation.error';

export type EventInvitationStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'EXPIRED'
  | 'REVOKED';

export type EventInvitationChannel = 'EMAIL';

export type EventInvitationPrimitives = {
  id?: string;
  eventId: string;
  invitedEmail: string;
  invitedByUserId: string;
  channel: EventInvitationChannel;
  status: EventInvitationStatus;
  tokenHash: string;
  expiresAt: Date;
  acceptedAt?: Date | null;
  revokedAt?: Date | null;
  deliveryFailedAt?: Date | null;
  lastDeliveryError?: string | null;
  createdAt?: Date;
};

export type CreateEventInvitationProps = {
  eventId: string;
  invitedEmail: string;
  invitedByUserId: string;
  channel: EventInvitationChannel;
  tokenHash: string;
  expiresAt: Date;
};

export class EventInvitation {
  private constructor(private readonly props: EventInvitationPrimitives) {}

  get id() {
    return this.props.id;
  }

  get eventId() {
    return this.props.eventId;
  }

  get invitedEmail() {
    return this.props.invitedEmail;
  }

  get status() {
    return this.props.status;
  }

  get expiresAt() {
    return this.props.expiresAt;
  }

  static create(props: CreateEventInvitationProps): EventInvitation {
    EventInvitation.assertValid(props);

    return new EventInvitation({
      eventId: props.eventId,
      invitedEmail: EventInvitation.normalizeEmail(props.invitedEmail),
      invitedByUserId: props.invitedByUserId,
      channel: props.channel,
      status: 'PENDING',
      tokenHash: props.tokenHash,
      expiresAt: props.expiresAt,
    });
  }

  static rehydrate(props: EventInvitationPrimitives): EventInvitation {
    return new EventInvitation({
      ...props,
      invitedEmail: EventInvitation.normalizeEmail(props.invitedEmail),
    });
  }

  expire(now: Date): EventInvitation {
    if (this.props.status !== 'PENDING' || this.props.expiresAt > now) {
      return this;
    }

    return new EventInvitation({
      ...this.props,
      status: 'EXPIRED',
    });
  }

  accept(now: Date): EventInvitation {
    if (this.props.status !== 'PENDING') {
      throw new EventInvitationValidationError('La invitación no está activa', [
        'token',
      ]);
    }

    if (this.props.expiresAt <= now) {
      throw new EventInvitationValidationError('La invitación expiró', [
        'token',
      ]);
    }

    return new EventInvitation({
      ...this.props,
      status: 'ACCEPTED',
      acceptedAt: now,
    });
  }

  markDeliveryFailed(message: string, now: Date): EventInvitation {
    return new EventInvitation({
      ...this.props,
      deliveryFailedAt: now,
      lastDeliveryError: message,
    });
  }

  toPrimitives(): EventInvitationPrimitives {
    return { ...this.props };
  }

  static normalizeEmail(email: string) {
    return email.trim().toLowerCase();
  }

  private static assertValid(props: CreateEventInvitationProps) {
    if (!props.eventId?.trim()) {
      throw new EventInvitationValidationError('Evento inválido', ['eventId']);
    }

    if (!props.invitedByUserId?.trim()) {
      throw new EventInvitationValidationError('Usuario no identificado', [
        'invitedByUserId',
      ]);
    }

    if (!props.tokenHash?.trim()) {
      throw new EventInvitationValidationError('Token inválido', ['token']);
    }

    const email = EventInvitation.normalizeEmail(props.invitedEmail);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new EventInvitationValidationError('Email inválido', ['email']);
    }

    if (Number.isNaN(props.expiresAt.getTime())) {
      throw new EventInvitationValidationError('Expiración inválida', [
        'expiresAt',
      ]);
    }
  }
}
