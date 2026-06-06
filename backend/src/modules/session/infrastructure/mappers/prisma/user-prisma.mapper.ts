import { User } from '../../../domain/entities/user.entity';

type PrismaUser = {
  id: string;
  email: string;
  displayName: string | null;
};

export class UserPrismaMapper {
  static toDomain(user: PrismaUser): User {
    return User.rehydrate({
      id: user.id,
      email: user.email,
      displayName: user.displayName,
    });
  }
}
