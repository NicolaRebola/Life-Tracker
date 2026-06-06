export const CHECK_DB_HEALTH = Symbol('CHECK_DB_HEALTH');

export type DbHealthResult = {
  status: 'ok';
  database: 'ok';
  latencyMs: number;
  timestamp: string;
  service: string;
};

export interface CheckDbHealthPort {
  execute(): Promise<DbHealthResult>;
}
