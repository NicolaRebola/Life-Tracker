import { Injectable, UnauthorizedException } from '@nestjs/common';
import { createHash, randomBytes } from 'crypto';
import { FirebaseAdminService } from 'src/shared/firebase/firebase-admin.service';
import { UserRepository } from '../infrastructure/user.repository';
import { SessionRepository } from '../infrastructure/session.repository';

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
    let decoded;
    try {
      decoded = await this.firebase.verifyIdToken(input.idToken);
    } catch {
      throw new UnauthorizedException('Invalid Firebase token');
    }

    const user = await this.users.upsertByFirebaseUid({
      firebaseUid: decoded.uid,
      email: decoded.email!,
      displayName: decoded.name ?? null,
    });

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