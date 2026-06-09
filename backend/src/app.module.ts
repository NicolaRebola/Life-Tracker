import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './shared/prisma/prisma.module';
import { HealthModule } from './modules/health/health.module';
import { SessionModule } from './modules/session/session.module';
import { FirebaseModule } from './shared/firebase/firebase.module';
import { EventModule } from './modules/events/events.module';

@Module({
  imports: [
    HealthModule,
    PrismaModule,
    SessionModule,
    FirebaseModule,
    EventModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
