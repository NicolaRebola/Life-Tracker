import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/shared/prisma/prisma.module';
import { SessionController } from './delivery/session.controller';
import { LoginUseCase } from './application/login-use-case';
import { FirebaseModule } from 'src/shared/firebase/firebase.module';
import { UserRepository } from './infrastructure/user.repository';
import { SessionRepository } from './infrastructure/session.repository';
import { SessionGuard } from './application/session.guard';

@Module({
  imports: [PrismaModule, FirebaseModule],
  controllers: [SessionController],
  providers: [LoginUseCase, UserRepository, SessionRepository, SessionGuard],
  exports: [SessionGuard, SessionRepository],
})
export class SessionModule {}
