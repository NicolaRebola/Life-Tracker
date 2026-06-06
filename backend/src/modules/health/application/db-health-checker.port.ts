export const DB_HEALTH_CHECKER = Symbol('DB_HEALTH_CHECKER');

export interface DbHealthCheckerPort {
  ping(): Promise<void>;
}
