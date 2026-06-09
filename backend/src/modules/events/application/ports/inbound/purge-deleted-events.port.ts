export const PURGE_DELETED_EVENTS = Symbol('PURGE_DELETED_EVENTS');

export type PurgeDeletedEventsResult = {
  purgedCount: number;
};

export interface PurgeDeletedEventsPort {
  execute(): Promise<PurgeDeletedEventsResult>;
}
