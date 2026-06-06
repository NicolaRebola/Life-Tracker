export const CREATE_EVENT = Symbol('CREATE_EVENT');

export type CreateEventCommand = {
  userId: string;
  fromDateTime: string;
  toDateTime: string;
  name: string;
  description?: string;
  notes?: string;
  tags?: string[];
};

export interface CreateEventPort {
  execute(command: CreateEventCommand): Promise<unknown>;
}
