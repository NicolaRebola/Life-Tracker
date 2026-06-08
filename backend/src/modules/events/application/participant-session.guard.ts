import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { createHash } from 'crypto';
import { PARTICIPANT_SESSION_COOKIE_NAME } from 'src/constants';
import {
  PARTICIPANT_SESSION_REPOSITORY,
  type ParticipantSessionRepositoryPort,
} from '../domain';

export type ParticipantAuthenticatedRequest = Request & {
  participant: {
    id: string;
    eventId: string;
    email: string;
    displayName: string | null;
  };
};

@Injectable()
export class ParticipantSessionGuard implements CanActivate {
  constructor(
    @Inject(PARTICIPANT_SESSION_REPOSITORY)
    private readonly sessions: ParticipantSessionRepositoryPort,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context
      .switchToHttp()
      .getRequest<ParticipantAuthenticatedRequest>();
    const cookies = req.cookies as Record<string, string> | undefined;
    const sessionToken = cookies?.[PARTICIPANT_SESSION_COOKIE_NAME] ?? null;

    if (!sessionToken) {
      throw new UnauthorizedException('Missing participant session token');
    }

    const tokenHash = createHash('sha256').update(sessionToken).digest('hex');
    const session = await this.sessions.findActiveByTokenHash(tokenHash);

    if (!session || session.participant.revokedAt) {
      throw new UnauthorizedException('Invalid participant session');
    }

    req.participant = {
      id: session.participant.id,
      eventId: session.participant.eventId,
      email: session.participant.email,
      displayName: session.participant.displayName,
    };

    return true;
  }
}
