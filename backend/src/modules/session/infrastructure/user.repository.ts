import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/shared/prisma/prisma.service";

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async upsertByFirebaseUid(data: {
    firebaseUid: string;
    email: string;
    displayName?: string | null;
  }) {
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