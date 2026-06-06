import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { SESSION_COOKIE_NAME } from 'src/constants';
import { Request } from 'express';
import { createHash } from 'crypto';
import { SESSION_REPOSITORY, type SessionRepositoryPort } from '../domain';

export type AuthenticatedRequest = Request & {
  user: {
    id: string;
    email: string;
    displayName: string | null;
  };
  session: {
    id: string;
  };
};

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(
    @Inject(SESSION_REPOSITORY)
    private readonly sessions: SessionRepositoryPort,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const cookies = req.cookies as Record<string, string> | undefined;
    const sessionToken: string | null = cookies?.[SESSION_COOKIE_NAME] ?? null;

    if (!sessionToken) throw new UnauthorizedException('Missing session token');

    const tokenHash = createHash('sha256').update(sessionToken).digest('hex');
    const session = await this.sessions.findActiveByTokenHash(tokenHash);

    if (!session) {
      throw new UnauthorizedException('Invalid or expired session');
    }

    if (!session.id || !session.user) {
      throw new UnauthorizedException('Invalid session data');
    }

    const user = session.user.toPrimitives();
    req.user = {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
    };
    req.session = {
      id: session.id,
    };
    return true;
  }
}
