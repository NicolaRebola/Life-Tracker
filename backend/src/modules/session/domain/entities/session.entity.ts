import { User, type UserPrimitives } from './user.entity';

export type SessionPrimitives = {
  id?: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  userAgent?: string;
  ipAddress?: string;
  user?: UserPrimitives;
};

export type CreateSessionProps = {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  userAgent?: string;
  ipAddress?: string;
};

export class Session {
  private constructor(private readonly props: SessionPrimitives) {}

  get id(): string | undefined {
    return this.props.id;
  }

  get expiresAt(): Date {
    return this.props.expiresAt;
  }

  get user(): User | undefined {
    return this.props.user ? User.rehydrate(this.props.user) : undefined;
  }

  static create(props: CreateSessionProps): Session {
    return new Session(props);
  }

  static rehydrate(props: SessionPrimitives): Session {
    return new Session(props);
  }

  toPrimitives(): SessionPrimitives {
    return {
      ...this.props,
      user: this.props.user ? { ...this.props.user } : undefined,
    };
  }
}
