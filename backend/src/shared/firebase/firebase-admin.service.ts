import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';
import type { FirebaseTokenVerifierPort } from 'src/modules/session/application/ports/inbound/firebase-token-verifier.port';

@Injectable()
export class FirebaseAdminService
  implements OnModuleInit, FirebaseTokenVerifierPort
{
  onModuleInit() {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
    }
  }

  async verifyIdToken(idToken: string): Promise<admin.auth.DecodedIdToken> {
    return admin.auth().verifyIdToken(idToken);
  }
}
