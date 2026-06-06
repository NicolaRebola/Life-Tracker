export type CreateEventDto = {
  fromDateTime: string;
  toDateTime: string;
  name: string;
  description?: string;
  notes?: string;
  tags?: string[];
};
