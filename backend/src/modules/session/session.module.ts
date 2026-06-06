import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/shared/prisma/prisma.module';
import { SessionController } from './delivery/session.controller';
import { LoginUseCase } from './application/login-use-case';
import { FirebaseModule } from 'src/shared/firebase/firebase.module';
import { UserRepository } from './infrastructure/user.repository';
import { SessionRepository } from './infrastructure/session.repository';
import { SessionGuard } from './application/session.guard';
import { LOGIN } from './application/login.port';
import { USER_REPOSITORY } from './application/user-repository.port';
import { SESSION_REPOSITORY } from './application/session-repository.port';
import { FIREBASE_TOKEN_VERIFIER } from './application/firebase-token-verifier.port';
import { FirebaseAdminService } from 'src/shared/firebase/firebase-admin.service';

@Module({
  imports: [PrismaModule, FirebaseModule],
  controllers: [SessionController],
  providers: [
    LoginUseCase,
    UserRepository,
    SessionRepository,
    SessionGuard,
    { provide: LOGIN, useExisting: LoginUseCase },
    { provide: USER_REPOSITORY, useExisting: UserRepository },
    { provide: SESSION_REPOSITORY, useExisting: SessionRepository },
    { provide: FIREBASE_TOKEN_VERIFIER, useExisting: FirebaseAdminService },
  ],
  exports: [SessionGuard, SESSION_REPOSITORY],
})
export class SessionModule {}
