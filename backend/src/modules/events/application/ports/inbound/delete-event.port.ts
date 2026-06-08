export const DELETE_EVENT = Symbol('DELETE_EVENT');

export type DeleteEventCommand = {
  userId: string;
  eventId: string;
};

export interface DeleteEventPort {
  execute(command: DeleteEventCommand): Promise<void>;
}
