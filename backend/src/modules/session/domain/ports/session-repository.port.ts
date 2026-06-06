import type { Session } from '../entities/session.entity';

export const SESSION_REPOSITORY = Symbol('SESSION_REPOSITORY');

export interface SessionRepositoryPort {
  create(session: Session): Promise<Session>;
  findActiveByTokenHash(tokenHash: string): Promise<Session | null>;
  revoke(id: string): Promise<void>;
}
