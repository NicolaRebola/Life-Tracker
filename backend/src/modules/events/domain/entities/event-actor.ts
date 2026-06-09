export type EventOwnerActor = {
  type: 'OWNER';
  userId: string;
};

export type EventParticipantActor = {
  type: 'PARTICIPANT';
  participantId: string;
  email: string;
};

export type EventActor = EventOwnerActor | EventParticipantActor;

export function isSameEventActor(
  actor: EventActor,
  author: { userId?: string | null; participantId?: string | null },
) {
  if (actor.type === 'OWNER') {
    return author.userId === actor.userId;
  }

  return author.participantId === actor.participantId;
}
