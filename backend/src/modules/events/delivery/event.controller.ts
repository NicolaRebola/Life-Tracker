import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CREATE_EVENT } from '../application/ports/inbound/create-event.port';
import { LIST_EVENTS } from '../application/ports/inbound/list-events.port';
import { SEARCH_EVENT_TAGS } from '../application/ports/inbound/search-event-tags.port';
import { UPDATE_EVENT_STATUS } from '../application/ports/inbound/update-event-status.port';
import { CreateEventValidationError } from '../application/errors/create-event-validation.error';
import { EventNotFoundError } from '../application/errors/event-not-found.error';
import { ListEventsValidationError } from '../application/errors/list-events-validation.error';
import { UpdateEventStatusValidationError } from '../application/errors/update-event-status-validation.error';
import { SessionGuard } from 'src/modules/session/application/session.guard';
import type { AuthenticatedRequest } from 'src/modules/session/application/session.guard';
import type { CreateEventPort } from '../application/ports/inbound/create-event.port';
import type { ListEventsPort } from '../application/ports/inbound/list-events.port';
import type { SearchEventTagsPort } from '../application/ports/inbound/search-event-tags.port';
import type { UpdateEventStatusPort } from '../application/ports/inbound/update-event-status.port';
import type { CreateEventDto } from './dto/create-event.dto';
import type { ListEventsQueryDto } from './dto/list-events-query.dto';
import type { UpdateEventStatusDto } from './dto/update-event-status.dto';
import type { EventStatus } from '../domain/entities/event-status';

@Controller('events')
@UseGuards(SessionGuard)
export class EventController {
  constructor(
    @Inject(CREATE_EVENT)
    private readonly createEventUseCase: CreateEventPort,
    @Inject(LIST_EVENTS)
    private readonly listEventsUseCase: ListEventsPort,
    @Inject(SEARCH_EVENT_TAGS)
    private readonly searchEventTagsUseCase: SearchEventTagsPort,
    @Inject(UPDATE_EVENT_STATUS)
    private readonly updateEventStatusUseCase: UpdateEventStatusPort,
  ) {}

  @Post()
  @HttpCode(201)
  async createEvent(
    @Body() body: CreateEventDto,
    @Req() req: AuthenticatedRequest,
  ) {
    try {
      const event = await this.createEventUseCase.execute({
        userId: req.user.id,
        fromDateTime: body.fromDateTime,
        toDateTime: body.toDateTime,
        name: body.name,
        description: body.description,
        notes: body.notes,
        tags: body.tags,
      });

      return { event };
    } catch (error) {
      if (error instanceof CreateEventValidationError) {
        throw new HttpException(
          { message: error.message, fields: error.fields },
          HttpStatus.BAD_REQUEST,
        );
      }

      throw error;
    }
  }

  @Get('tags')
  async searchTags(
    @Query('name') name: string | undefined,
    @Query('limit') limit: string | undefined,
    @Req() req: AuthenticatedRequest,
  ) {
    try {
      return await this.searchEventTagsUseCase.execute({
        userId: req.user.id,
        name,
        limit: limit ? Number(limit) : undefined,
      });
    } catch (error) {
      if (error instanceof ListEventsValidationError) {
        throw new HttpException(
          { message: error.message, fields: error.fields },
          HttpStatus.BAD_REQUEST,
        );
      }

      throw error;
    }
  }

  @Get()
  async listEvents(
    @Query() query: ListEventsQueryDto,
    @Req() req: AuthenticatedRequest,
  ) {
    try {
      const page = query.page ? Number(query.page) : undefined;
      const limit = query.limit ? Number(query.limit) : undefined;

      const tags = query.tags
        ?.split(',')
        .map((tag) => tag.trim())
        .filter(Boolean);

      return await this.listEventsUseCase.execute({
        userId: req.user.id,
        name: query.name,
        status: query.status as EventStatus | undefined,
        tags,
        page,
        limit,
      });
    } catch (error) {
      if (error instanceof ListEventsValidationError) {
        throw new HttpException(
          { message: error.message, fields: error.fields },
          HttpStatus.BAD_REQUEST,
        );
      }

      throw error;
    }
  }

  @Patch(':id/status')
  async updateEventStatus(
    @Param('id') eventId: string,
    @Body() body: UpdateEventStatusDto,
    @Req() req: AuthenticatedRequest,
  ) {
    try {
      const event = await this.updateEventStatusUseCase.execute({
        userId: req.user.id,
        eventId,
        status: body.status,
      });

      return { event };
    } catch (error) {
      if (error instanceof UpdateEventStatusValidationError) {
        throw new HttpException(
          { message: error.message, fields: error.fields },
          HttpStatus.BAD_REQUEST,
        );
      }

      if (error instanceof EventNotFoundError) {
        throw new HttpException(
          { message: error.message },
          HttpStatus.NOT_FOUND,
        );
      }

      throw error;
    }
  }
}
