import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Inject,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { GET_SHARED_EVENT } from '../application/ports/inbound/get-shared-event.port';
import { LIST_EVENT_COMMENTS } from '../application/ports/inbound/list-event-comments.port';
import { CREATE_EVENT_COMMENT } from '../application/ports/inbound/create-event-comment.port';
import { EventNotFoundError } from '../application/errors/event-not-found.error';
import { CreateEventCommentValidationError } from '../application/errors/create-event-comment-validation.error';
import {
  ParticipantSessionGuard,
  type ParticipantAuthenticatedRequest,
} from '../application/participant-session.guard';
import type { GetSharedEventPort } from '../application/ports/inbound/get-shared-event.port';
import type { ListEventCommentsPort } from '../application/ports/inbound/list-event-comments.port';
import type { CreateEventCommentPort } from '../application/ports/inbound/create-event-comment.port';
import type { CreateEventCommentDto } from './dto/create-event-comment.dto';

@Controller('shared/events')
@UseGuards(ParticipantSessionGuard)
export class SharedEventController {
  constructor(
    @Inject(GET_SHARED_EVENT)
    private readonly getSharedEventUseCase: GetSharedEventPort,
    @Inject(LIST_EVENT_COMMENTS)
    private readonly listEventCommentsUseCase: ListEventCommentsPort,
    @Inject(CREATE_EVENT_COMMENT)
    private readonly createEventCommentUseCase: CreateEventCommentPort,
  ) {}

  @Get(':id')
  async getSharedEvent(
    @Param('id') eventId: string,
    @Req() req: ParticipantAuthenticatedRequest,
  ) {
    try {
      return await this.getSharedEventUseCase.execute({
        participantId: req.participant.id,
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

  @Get(':id/comments')
  async listSharedEventComments(
    @Param('id') eventId: string,
    @Req() req: ParticipantAuthenticatedRequest,
  ) {
    try {
      return await this.listEventCommentsUseCase.execute({
        participantId: req.participant.id,
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
  async createSharedEventComment(
    @Param('id') eventId: string,
    @Body() body: CreateEventCommentDto,
    @Req() req: ParticipantAuthenticatedRequest,
  ) {
    try {
      return await this.createEventCommentUseCase.execute({
        participantId: req.participant.id,
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
}
