import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import type {
  UserRepositoryPort,
  UserToUpsert,
} from '../application/user-repository.port';

@Injectable()
export class UserRepository implements UserRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async upsertByFirebaseUid(data: UserToUpsert) {
    return this.prisma.user.upsert({
      where: { firebaseUid: data.firebaseUid },
      update: {
        email: data.email,
        displayName: data.displayName ?? undefined,
      },
      create: {
        firebaseUid: data.firebaseUid,
        email: data.email,
        displayName: data.displayName,
      },
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }
}
