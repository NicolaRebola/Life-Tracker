import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/shared/prisma/prisma.module';
import { EventController } from './delivery/event.controller';
import { USE_CASES } from './application';
import { REPOSITORIES } from './infrastructure/repositories';
import { SessionModule } from '../session/session.module';
import { EVENT_REPOSITORY } from './domain';
import { PrismaEventRepository } from './infrastructure/repositories/prisma/event.repository';
import { CREATE_EVENT } from './application/ports/inbound/create-event.port';
import { DELETE_EVENT } from './application/ports/inbound/delete-event.port';
import { LIST_EVENTS } from './application/ports/inbound/list-events.port';
import { PURGE_DELETED_EVENTS } from './application/ports/inbound/purge-deleted-events.port';
import { SEARCH_EVENT_TAGS } from './application/ports/inbound/search-event-tags.port';
import { UPDATE_EVENT_STATUS } from './application/ports/inbound/update-event-status.port';
import { UPDATE_EVENT } from './application/ports/inbound/update-event.port';
import { CreateEventUseCase } from './application/use-cases/create-event-use-case';
import { DeleteEventUseCase } from './application/use-cases/delete-event-use-case';
import { ListEventsUseCase } from './application/use-cases/list-events-use-case';
import { PurgeDeletedEventsUseCase } from './application/use-cases/purge-deleted-events-use-case';
import { SearchEventTagsUseCase } from './application/use-cases/search-event-tags-use-case';
import { UpdateEventStatusUseCase } from './application/use-cases/update-event-status-use-case';
import { UpdateEventUseCase } from './application/use-cases/update-event-use-case';

@Module({
  imports: [PrismaModule, SessionModule],
  controllers: [EventController],
  providers: [
    ...USE_CASES,
    ...REPOSITORIES,
    { provide: CREATE_EVENT, useExisting: CreateEventUseCase },
    { provide: DELETE_EVENT, useExisting: DeleteEventUseCase },
    { provide: LIST_EVENTS, useExisting: ListEventsUseCase },
    { provide: PURGE_DELETED_EVENTS, useExisting: PurgeDeletedEventsUseCase },
    { provide: SEARCH_EVENT_TAGS, useExisting: SearchEventTagsUseCase },
    { provide: UPDATE_EVENT_STATUS, useExisting: UpdateEventStatusUseCase },
    { provide: UPDATE_EVENT, useExisting: UpdateEventUseCase },
    { provide: EVENT_REPOSITORY, useExisting: PrismaEventRepository },
  ],
})
export class EventModule {}
