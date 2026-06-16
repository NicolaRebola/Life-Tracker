import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/shared/prisma/prisma.module';
import { SessionController } from './delivery/session.controller';
import { LoginUseCase } from './application/use-cases/login-use-case';
import { FirebaseModule } from 'src/shared/firebase/firebase.module';
import { SessionGuard } from './application/session.guard';
import { LOGIN } from './application/ports/inbound/login.port';
import { USER_REPOSITORY, SESSION_REPOSITORY } from './domain';
import { FIREBASE_TOKEN_VERIFIER } from './application/ports/inbound/firebase-token-verifier.port';
import { FirebaseAdminService } from 'src/shared/firebase/firebase-admin.service';
import { PrismaUserRepository } from './infrastructure/repositories/prisma/user.repository';
import { PrismaSessionRepository } from './infrastructure/repositories/prisma/session.repository';

@Module({
  imports: [PrismaModule, FirebaseModule],
  controllers: [SessionController],
  providers: [
    LoginUseCase,
    PrismaUserRepository,
    PrismaSessionRepository,
    SessionGuard,
    { provide: LOGIN, useExisting: LoginUseCase },
    { provide: USER_REPOSITORY, useExisting: PrismaUserRepository },
    { provide: SESSION_REPOSITORY, useExisting: PrismaSessionRepository },
    { provide: FIREBASE_TOKEN_VERIFIER, useExisting: FirebaseAdminService },
  ],
  exports: [SessionGuard, SESSION_REPOSITORY, USER_REPOSITORY],
})
export class SessionModule {}
