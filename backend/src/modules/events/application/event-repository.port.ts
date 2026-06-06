export const EVENT_REPOSITORY = Symbol("EVENT_REPOSITORY");

export type EventToCreate = {
  name: string;
  description: string;
  notes: string;
  fromDateTime: Date;
  toDateTime: Date;
  userId: string;
};

export type TagToCreate = {
  name: string;
  label: string;
};

export interface EventRepositoryPort {
  createWithTags(event: EventToCreate, tags: TagToCreate[]): Promise<unknown>;
}
