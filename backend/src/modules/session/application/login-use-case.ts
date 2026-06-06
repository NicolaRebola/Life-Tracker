import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { createHash, randomBytes } from 'crypto';
import {
  FIREBASE_TOKEN_VERIFIER,
  type FirebaseTokenPayload,
  type FirebaseTokenVerifierPort,
} from './firebase-token-verifier.port';
import {
  USER_REPOSITORY,
  type SessionUser,
  type UserRepositoryPort,
} from './user-repository.port';
import {
  SESSION_REPOSITORY,
  type SessionRepositoryPort,
} from './session-repository.port';
import type { LoginCommand, LoginPort, LoginResult } from './login.port';

@Injectable()
export class LoginUseCase implements LoginPort {
  constructor(
    @Inject(FIREBASE_TOKEN_VERIFIER)
    private readonly firebase: FirebaseTokenVerifierPort,
    @Inject(USER_REPOSITORY)
    private readonly users: UserRepositoryPort,
    @Inject(SESSION_REPOSITORY)
    private readonly sessions: SessionRepositoryPort,
  ) {}

  async execute(input: LoginCommand): Promise<LoginResult> {
    let decoded: FirebaseTokenPayload;
    try {
      decoded = await this.firebase.verifyIdToken(input.idToken);
    } catch {
      throw new UnauthorizedException('Invalid Firebase token');
    }

    if (!decoded.email) {
      throw new UnauthorizedException('Firebase token does not include email');
    }

    const displayNameClaim: unknown = decoded.name;

    const displayName =
      typeof displayNameClaim === 'string' ? displayNameClaim : null;
    const user: SessionUser | null = await this.users.upsertByFirebaseUid({
      firebaseUid: decoded.uid,
      email: decoded.email,
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
