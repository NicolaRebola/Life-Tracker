export const LOGIN = Symbol('LOGIN');

export type LoginCommand = {
  idToken: string;
  userAgent?: string;
  ipAddress?: string;
};

export type LoginResult = {
  sessionToken: string;
  expiresAt: Date;
  user: {
    id: string;
    email: string;
    displayName: string | null;
  };
};

export interface LoginPort {
  execute(input: LoginCommand): Promise<LoginResult>;
}
