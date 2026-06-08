export const REMOVE_EVENT_PARTICIPANT = Symbol('REMOVE_EVENT_PARTICIPANT');

export type RemoveEventParticipantCommand = {
  userId: string;
  eventId: string;
  participantId: string;
};

export interface RemoveEventParticipantPort {
  execute(command: RemoveEventParticipantCommand): Promise<void>;
}
