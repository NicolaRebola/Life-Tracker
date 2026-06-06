import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { SessionRepository } from "../infrastructure/session.repository";
import { SESSION_COOKIE_NAME } from "src/constants";
import { Request } from "express";
import { createHash } from "crypto";

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
  constructor(private readonly sessions: SessionRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const sessionToken = req.cookies?.[SESSION_COOKIE_NAME];

    if (!sessionToken) throw new UnauthorizedException("Missing session token");

    const tokenHash = createHash("sha256").update(sessionToken).digest("hex");
    const session = await this.sessions.findActiveByTokenHash(tokenHash);

    if (!session) {
      throw new UnauthorizedException("Invalid or expired session");
    }
    req.user = {
      id: session.user.id,
      email: session.user.email,
      displayName: session.user.displayName,
    };
    req.session = {
      id: session.id,
    };
    return true;
  }
}