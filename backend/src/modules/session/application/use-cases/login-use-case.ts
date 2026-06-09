import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { createHash, randomBytes } from 'crypto';
import {
  FIREBASE_TOKEN_VERIFIER,
  type FirebaseTokenPayload,
  type FirebaseTokenVerifierPort,
} from '../ports/inbound/firebase-token-verifier.port';
import {
  SESSION_REPOSITORY,
  Session,
  USER_REPOSITORY,
  type SessionRepositoryPort,
  type User,
  type UserRepositoryPort,
} from '../../domain';
import type {
  LoginCommand,
  LoginPort,
  LoginResult,
} from '../ports/inbound/login.port';

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
    const user: User | null = await this.users.upsertByFirebaseUid({
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

    const session = await this.sessions.create(
      Session.create({
        userId: user.id,
        tokenHash,
        expiresAt,
        userAgent: input.userAgent,
        ipAddress: input.ipAddress,
      }),
    );

    const userPrimitives = user.toPrimitives();
    return {
      sessionToken, // el BFF lo pone en cookie httpOnly
      expiresAt: session.expiresAt,
      user: {
        id: userPrimitives.id,
        email: userPrimitives.email,
        displayName: userPrimitives.displayName,
      },
    };
  }
}
