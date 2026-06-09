import type { User } from '../entities/user.entity';

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export type UserToUpsert = {
  firebaseUid: string;
  email: string;
  displayName?: string | null;
};

export interface UserRepositoryPort {
  upsertByFirebaseUid(data: UserToUpsert): Promise<User | null>;
  findById(id: string): Promise<User | null>;
}
