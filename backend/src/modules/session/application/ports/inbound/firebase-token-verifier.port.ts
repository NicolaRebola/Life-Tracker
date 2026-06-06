export const FIREBASE_TOKEN_VERIFIER = Symbol('FIREBASE_TOKEN_VERIFIER');

export type FirebaseTokenPayload = {
  uid: string;
  email?: string;
  name?: unknown;
};

export interface FirebaseTokenVerifierPort {
  verifyIdToken(idToken: string): Promise<FirebaseTokenPayload>;
}
