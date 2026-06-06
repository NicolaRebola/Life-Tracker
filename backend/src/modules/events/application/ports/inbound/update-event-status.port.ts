import type { EventStatus } from '../../../domain/entities/event-status';

export const UPDATE_EVENT_STATUS = Symbol('UPDATE_EVENT_STATUS');

export type UpdateEventStatusCommand = {
  userId: string;
  eventId: string;
  status: EventStatus;
};

export type UpdateEventStatusResult = {
  id: string;
  status: EventStatus;
};

export interface UpdateEventStatusPort {
  execute(command: UpdateEventStatusCommand): Promise<UpdateEventStatusResult>;
}
