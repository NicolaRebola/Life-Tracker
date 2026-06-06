import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import type { UserRepositoryPort, UserToUpsert } from '../../../domain';
import { UserPrismaMapper } from '../../mappers/prisma/user-prisma.mapper';

@Injectable()
export class PrismaUserRepository implements UserRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async upsertByFirebaseUid(data: UserToUpsert) {
    const user = await this.prisma.user.upsert({
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

    return UserPrismaMapper.toDomain(user);
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user ? UserPrismaMapper.toDomain(user) : null;
  }
}
