import type { SessionUser } from './user-repository.port';

export const SESSION_REPOSITORY = Symbol('SESSION_REPOSITORY');

export type SessionToCreate = {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  userAgent?: string;
  ipAddress?: string;
};

export type CreatedSession = {
  expiresAt: Date;
};

export type ActiveSession = {
  id: string;
  user: SessionUser;
};

export interface SessionRepositoryPort {
  create(data: SessionToCreate): Promise<CreatedSession>;
  findActiveByTokenHash(tokenHash: string): Promise<ActiveSession | null>;
  revoke(id: string): Promise<unknown>;
}
