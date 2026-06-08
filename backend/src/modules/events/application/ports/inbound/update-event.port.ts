import type { EventStatus } from '../../../domain/entities/event-status';

export const UPDATE_EVENT = Symbol('UPDATE_EVENT');

export type UpdateEventCommand = {
  userId: string;
  eventId: string;
  fromDateTime: string;
  toDateTime: string;
  name: string;
  description?: string;
  notes?: string;
  tags?: string[];
};

export type UpdateEventResult = {
  id: string;
  name: string;
  description: string;
  notes: string;
  fromDateTime: string;
  toDateTime: string;
  status: EventStatus;
  tags: Array<{ name: string; label: string }>;
};

export interface UpdateEventPort {
  execute(command: UpdateEventCommand): Promise<UpdateEventResult>;
}
