export type UserPrimitives = {
  id: string;
  email: string;
  displayName: string | null;
};

export class User {
  private constructor(private readonly props: UserPrimitives) {}

  get id(): string {
    return this.props.id;
  }

  get email(): string {
    return this.props.email;
  }

  get displayName(): string | null {
    return this.props.displayName;
  }

  static rehydrate(props: UserPrimitives): User {
    return new User(props);
  }

  toPrimitives(): UserPrimitives {
    return { ...this.props };
  }
}
