export const LIST_EVENT_PARTICIPANTS = Symbol('LIST_EVENT_PARTICIPANTS');

export type EventParticipantResponseItem = {
  id: string;
  email: string;
  displayName: string | null;
  status: 'ACCEPTED' | 'PENDING' | 'EXPIRED' | 'REVOKED';
  invitedAt?: string;
  joinedAt?: string;
  expiresAt?: string;
  deliveryFailedAt?: string;
  lastDeliveryError?: string | null;
};

export type ListEventParticipantsCommand = {
  userId: string;
  eventId: string;
};

export type ListEventParticipantsResult = {
  items: EventParticipantResponseItem[];
};

export interface ListEventParticipantsPort {
  execute(
    command: ListEventParticipantsCommand,
  ): Promise<ListEventParticipantsResult>;
}
