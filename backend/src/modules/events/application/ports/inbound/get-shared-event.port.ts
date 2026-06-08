export const GET_SHARED_EVENT = Symbol('GET_SHARED_EVENT');

export type GetSharedEventCommand = {
  participantId: string;
  eventId: string;
};

export type SharedEventResult = {
  event: {
    id: string;
    name: string;
    description: string;
    notes: string;
    fromDateTime: string;
    toDateTime: string;
    status: string;
    tags: Array<{ name: string; label: string }>;
  };
};

export interface GetSharedEventPort {
  execute(command: GetSharedEventCommand): Promise<SharedEventResult>;
}
