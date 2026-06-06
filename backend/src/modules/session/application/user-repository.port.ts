export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export type SessionUser = {
  id: string;
  email: string;
  displayName: string | null;
};

export type UserToUpsert = {
  firebaseUid: string;
  email: string;
  displayName?: string | null;
};

export interface UserRepositoryPort {
  upsertByFirebaseUid(data: UserToUpsert): Promise<SessionUser | null>;
  findById(id: string): Promise<SessionUser | null>;
}
