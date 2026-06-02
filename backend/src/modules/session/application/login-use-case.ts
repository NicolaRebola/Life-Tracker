import { Injectable, UnauthorizedException } from '@nestjs/common';
import { createHash, randomBytes } from 'crypto';
import { FirebaseAdminService } from 'src/shared/firebase/firebase-admin.service';
import { UserRepository } from '../infrastructure/user.repository';
import { SessionRepository } from '../infrastructure/session.repository';
import { User } from '@prisma/client';
import * as admin from 'firebase-admin';
@Injectable()
export class LoginUseCase {
  constructor(
    private readonly firebase: FirebaseAdminService,
    private readonly users: UserRepository,
    private readonly sessions: SessionRepository,
  ) {}

  async execute(input: {
    idToken: string;
    userAgent?: string;
    ipAddress?: string;
  }) {
    let decoded: admin.auth.DecodedIdToken;
    try {
      decoded = await this.firebase.verifyIdToken(input.idToken);
    } catch {
      throw new UnauthorizedException('Invalid Firebase token');
    }

    const displayNameClaim: unknown = decoded['name'];

    const displayName =
      typeof displayNameClaim === 'string' ? displayNameClaim : null;
    const user: User | null = await this.users.upsertByFirebaseUid({
      firebaseUid: decoded.uid,
      email: decoded.email!,
      displayName,
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const sessionToken = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(sessionToken).digest('hex');

    const ttlDays = Number(process.env.SESSION_TTL_DAYS ?? 7);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + ttlDays);

    const session = await this.sessions.create({
      userId: user.id,
      tokenHash,
      expiresAt,
      userAgent: input.userAgent,
      ipAddress: input.ipAddress,
    });

    return {
      sessionToken, // el BFF lo pone en cookie httpOnly
      expiresAt: session.expiresAt,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
      },
    };
  }
}
