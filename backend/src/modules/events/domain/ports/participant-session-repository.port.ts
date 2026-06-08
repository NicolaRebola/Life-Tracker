export const PARTICIPANT_SESSION_REPOSITORY = Symbol(
  'PARTICIPANT_SESSION_REPOSITORY',
);

export type ParticipantSessionWithParticipant = {
  id: string;
  participant: {
    id: string;
    eventId: string;
    email: string;
    displayName: string | null;
    revokedAt: Date | null;
  };
};

export interface ParticipantSessionRepositoryPort {
  create(command: {
    participantId: string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<{ id: string; expiresAt: Date }>;
  findActiveByTokenHash(
    tokenHash: string,
  ): Promise<ParticipantSessionWithParticipant | null>;
}
