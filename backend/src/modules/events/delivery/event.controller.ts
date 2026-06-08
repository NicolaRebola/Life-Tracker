import {
  Body,
  Controller,
  Delete,
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
import { CREATE_EVENT_COMMENT } from '../application/ports/inbound/create-event-comment.port';
import { CREATE_EVENT } from '../application/ports/inbound/create-event.port';
import { DELETE_EVENT_COMMENT } from '../application/ports/inbound/delete-event-comment.port';
import { DELETE_EVENT } from '../application/ports/inbound/delete-event.port';
import { LIST_EVENT_COMMENTS } from '../application/ports/inbound/list-event-comments.port';
import { LIST_EVENTS } from '../application/ports/inbound/list-events.port';
import { SEARCH_EVENT_TAGS } from '../application/ports/inbound/search-event-tags.port';
import { UPDATE_EVENT_COMMENT } from '../application/ports/inbound/update-event-comment.port';
import { UPDATE_EVENT_STATUS } from '../application/ports/inbound/update-event-status.port';
import { UPDATE_EVENT } from '../application/ports/inbound/update-event.port';
import { CreateEventCommentValidationError } from '../application/errors/create-event-comment-validation.error';
import { CreateEventValidationError } from '../application/errors/create-event-validation.error';
import { DeleteEventCommentValidationError } from '../application/errors/delete-event-comment-validation.error';
import { DeleteEventValidationError } from '../application/errors/delete-event-validation.error';
import { EventCommentForbiddenError } from '../application/errors/event-comment-forbidden.error';
import { EventCommentNotFoundError } from '../application/errors/event-comment-not-found.error';
import { EventNotFoundError } from '../application/errors/event-not-found.error';
import { ListEventsValidationError } from '../application/errors/list-events-validation.error';
import { UpdateEventCommentValidationError } from '../application/errors/update-event-comment-validation.error';
import { UpdateEventStatusConflictError } from '../application/errors/update-event-status-conflict.error';
import { UpdateEventStatusValidationError } from '../application/errors/update-event-status-validation.error';
import { UpdateEventValidationError } from '../application/errors/update-event-validation.error';
import { SessionGuard } from 'src/modules/session/application/session.guard';
import type { AuthenticatedRequest } from 'src/modules/session/application/session.guard';
import type { CreateEventCommentPort } from '../application/ports/inbound/create-event-comment.port';
import type { CreateEventPort } from '../application/ports/inbound/create-event.port';
import type { DeleteEventCommentPort } from '../application/ports/inbound/delete-event-comment.port';
import type { DeleteEventPort } from '../application/ports/inbound/delete-event.port';
import type { ListEventCommentsPort } from '../application/ports/inbound/list-event-comments.port';
import type { ListEventsPort } from '../application/ports/inbound/list-events.port';
import type { SearchEventTagsPort } from '../application/ports/inbound/search-event-tags.port';
import type { UpdateEventCommentPort } from '../application/ports/inbound/update-event-comment.port';
import type { UpdateEventStatusPort } from '../application/ports/inbound/update-event-status.port';
import type { UpdateEventPort } from '../application/ports/inbound/update-event.port';
import type { CreateEventCommentDto } from './dto/create-event-comment.dto';
import type { CreateEventDto } from './dto/create-event.dto';
import type { ListEventsQueryDto } from './dto/list-events-query.dto';
import type { UpdateEventCommentDto } from './dto/update-event-comment.dto';
import type { UpdateEventStatusDto } from './dto/update-event-status.dto';
import type { UpdateEventDto } from './dto/update-event.dto';
import type { EventStatus } from '../domain/entities/event-status';

@Controller('events')
@UseGuards(SessionGuard)
export class EventController {
  constructor(
    @Inject(CREATE_EVENT)
    private readonly createEventUseCase: CreateEventPort,
    @Inject(CREATE_EVENT_COMMENT)
    private readonly createEventCommentUseCase: CreateEventCommentPort,
    @Inject(DELETE_EVENT)
    private readonly deleteEventUseCase: DeleteEventPort,
    @Inject(DELETE_EVENT_COMMENT)
    private readonly deleteEventCommentUseCase: DeleteEventCommentPort,
    @Inject(LIST_EVENTS)
    private readonly listEventsUseCase: ListEventsPort,
    @Inject(LIST_EVENT_COMMENTS)
    private readonly listEventCommentsUseCase: ListEventCommentsPort,
    @Inject(SEARCH_EVENT_TAGS)
    private readonly searchEventTagsUseCase: SearchEventTagsPort,
    @Inject(UPDATE_EVENT_COMMENT)
    private readonly updateEventCommentUseCase: UpdateEventCommentPort,
    @Inject(UPDATE_EVENT_STATUS)
    private readonly updateEventStatusUseCase: UpdateEventStatusPort,
    @Inject(UPDATE_EVENT)
    private readonly updateEventUseCase: UpdateEventPort,
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

      if (error instanceof UpdateEventStatusConflictError) {
        throw new HttpException(
          {
            message: error.message,
            fromStatus: error.fromStatus,
            currentStatus: error.currentStatus,
            requestedStatus: error.requestedStatus,
          },
          HttpStatus.CONFLICT,
        );
      }

      throw error;
    }
  }

  @Patch(':id')
  async updateEvent(
    @Param('id') eventId: string,
    @Body() body: UpdateEventDto,
    @Req() req: AuthenticatedRequest,
  ) {
    try {
      const event = await this.updateEventUseCase.execute({
        userId: req.user.id,
        eventId,
        fromDateTime: body.fromDateTime,
        toDateTime: body.toDateTime,
        name: body.name,
        description: body.description,
        notes: body.notes,
        tags: body.tags,
      });

      return { event };
    } catch (error) {
      if (error instanceof UpdateEventValidationError) {
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

  @Get(':id/comments')
  async listEventComments(
    @Param('id') eventId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    try {
      return await this.listEventCommentsUseCase.execute({
        userId: req.user.id,
        eventId,
      });
    } catch (error) {
      if (error instanceof EventNotFoundError) {
        throw new HttpException(
          { message: error.message },
          HttpStatus.NOT_FOUND,
        );
      }

      throw error;
    }
  }

  @Post(':id/comments')
  @HttpCode(201)
  async createEventComment(
    @Param('id') eventId: string,
    @Body() body: CreateEventCommentDto,
    @Req() req: AuthenticatedRequest,
  ) {
    try {
      return await this.createEventCommentUseCase.execute({
        userId: req.user.id,
        eventId,
        body: body.body,
      });
    } catch (error) {
      if (error instanceof CreateEventCommentValidationError) {
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

  @Patch(':id/comments/:commentId')
  async updateEventComment(
    @Param('id') eventId: string,
    @Param('commentId') commentId: string,
    @Body() body: UpdateEventCommentDto,
    @Req() req: AuthenticatedRequest,
  ) {
    try {
      return await this.updateEventCommentUseCase.execute({
        userId: req.user.id,
        eventId,
        commentId,
        body: body.body,
      });
    } catch (error) {
      if (error instanceof UpdateEventCommentValidationError) {
        throw new HttpException(
          { message: error.message, fields: error.fields },
          HttpStatus.BAD_REQUEST,
        );
      }

      if (error instanceof EventCommentNotFoundError) {
        throw new HttpException(
          { message: error.message },
          HttpStatus.NOT_FOUND,
        );
      }

      if (error instanceof EventCommentForbiddenError) {
        throw new HttpException(
          { message: error.message },
          HttpStatus.FORBIDDEN,
        );
      }

      throw error;
    }
  }

  @Delete(':id/comments/:commentId')
  @HttpCode(204)
  async deleteEventComment(
    @Param('id') eventId: string,
    @Param('commentId') commentId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    try {
      await this.deleteEventCommentUseCase.execute({
        userId: req.user.id,
        eventId,
        commentId,
      });
    } catch (error) {
      if (error instanceof DeleteEventCommentValidationError) {
        throw new HttpException(
          { message: error.message, fields: error.fields },
          HttpStatus.BAD_REQUEST,
        );
      }

      if (error instanceof EventCommentNotFoundError) {
        throw new HttpException(
          { message: error.message },
          HttpStatus.NOT_FOUND,
        );
      }

      throw error;
    }
  }

  @Delete(':id')
  @HttpCode(204)
  async deleteEvent(
    @Param('id') eventId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    try {
      await this.deleteEventUseCase.execute({
        userId: req.user.id,
        eventId,
      });
    } catch (error) {
      if (error instanceof DeleteEventValidationError) {
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
