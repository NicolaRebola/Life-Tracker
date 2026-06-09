export type UpdateEventDto = {
  fromDateTime: string;
  toDateTime: string;
  name: string;
  description?: string;
  notes?: string;
  tags?: string[];
};
