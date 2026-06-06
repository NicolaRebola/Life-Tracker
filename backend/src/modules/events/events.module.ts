import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/shared/prisma/prisma.module';
import { EventController } from './delivery/event.controller';
import { USE_CASES } from './application';
import { REPOSITORIES } from './infrastructure/repositories';
import { SessionModule } from '../session/session.module';
import { EVENT_REPOSITORY } from './domain';
import { PrismaEventRepository } from './infrastructure/repositories/prisma/event.repository';
import { CREATE_EVENT } from './application/ports/inbound/create-event.port';
import { CreateEventUseCase } from './application/use-cases/create-event-use-case';

@Module({
  imports: [PrismaModule, SessionModule],
  controllers: [EventController],
  providers: [
    ...USE_CASES,
    ...REPOSITORIES,
    { provide: CREATE_EVENT, useExisting: CreateEventUseCase },
    { provide: EVENT_REPOSITORY, useExisting: PrismaEventRepository },
  ],
})
export class EventModule {}
