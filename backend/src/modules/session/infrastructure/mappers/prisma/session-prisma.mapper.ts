import { Session } from '../../../domain/entities/session.entity';

type PrismaSession = {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  userAgent: string | null;
  ipAddress: string | null;
  user?: {
    id: string;
    email: string;
    displayName: string | null;
  };
};

export class SessionPrismaMapper {
  static toPersistence(session: Session) {
    const props = session.toPrimitives();

    return {
      userId: props.userId,
      tokenHash: props.tokenHash,
      expiresAt: props.expiresAt,
      userAgent: props.userAgent,
      ipAddress: props.ipAddress,
    };
  }

  static toDomain(session: PrismaSession): Session {
    return Session.rehydrate({
      id: session.id,
      userId: session.userId,
      tokenHash: session.tokenHash,
      expiresAt: session.expiresAt,
      userAgent: session.userAgent ?? undefined,
      ipAddress: session.ipAddress ?? undefined,
      user: session.user
        ? {
            id: session.user.id,
            email: session.user.email,
            displayName: session.user.displayName,
          }
        : undefined,
    });
  }
}
