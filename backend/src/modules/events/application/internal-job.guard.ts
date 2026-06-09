import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { timingSafeEqual } from 'crypto';

type RequestWithHeaders = {
  headers: Record<string, string | string[] | undefined>;
};

const INTERNAL_JOB_SECRET_HEADER = 'x-internal-job-secret';

@Injectable()
export class InternalJobGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const expectedSecret = process.env.OUTBOX_DISPATCH_SECRET;
    if (!expectedSecret) {
      throw new UnauthorizedException('Internal job secret is not configured');
    }

    const request = context.switchToHttp().getRequest<RequestWithHeaders>();
    const providedSecret = request.headers[INTERNAL_JOB_SECRET_HEADER];
    const value = Array.isArray(providedSecret)
      ? providedSecret[0]
      : providedSecret;

    if (!value || !this.secretsMatch(value, expectedSecret)) {
      throw new UnauthorizedException('Invalid internal job secret');
    }

    return true;
  }

  private secretsMatch(
    providedSecret: string,
    expectedSecret: string,
  ): boolean {
    const provided = Buffer.from(providedSecret);
    const expected = Buffer.from(expectedSecret);

    if (provided.length !== expected.length) {
      return false;
    }

    return timingSafeEqual(provided, expected);
  }
}
