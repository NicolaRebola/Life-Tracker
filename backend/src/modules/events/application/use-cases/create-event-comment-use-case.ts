import { Inject, Injectable } from '@nestjs/common';
import {
  EVENT_COMMENT_REPOSITORY,
  EVENT_REPOSITORY,
  EventComment,
  EventCommentValidationError,
  type EventCommentRepositoryPort,
  type EventRepositoryPort,
} from '../../domain';
import { CreateEventCommentValidationError } from '../errors/create-event-comment-validation.error';
import { EventNotFoundError } from '../errors/event-not-found.error';
import { toEventCommentListItem } from '../mappers/event-comment.mapper';
import type {
  CreateEventCommentCommand,
  CreateEventCommentPort,
  CreateEventCommentResult,
} from '../ports/inbound/create-event-comment.port';

@Injectable()
export class CreateEventCommentUseCase implements CreateEventCommentPort {
  constructor(
    @Inject(EVENT_REPOSITORY)
    private readonly eventRepository: EventRepositoryPort,
    @Inject(EVENT_COMMENT_REPOSITORY)
    private readonly eventCommentRepository: EventCommentRepositoryPort,
  ) {}

  async execute(
    command: CreateEventCommentCommand,
  ): Promise<CreateEventCommentResult> {
    const event = await this.eventRepository.findByIdForUser(
      command.userId,
      command.eventId,
    );

    if (!event) {
      throw new EventNotFoundError();
    }

    const comment = this.createDomainComment(command);
    const savedComment = await this.eventCommentRepository.save(comment);

    return {
      comment: toEventCommentListItem(savedComment, command.userId),
    };
  }

  private createDomainComment(
    command: CreateEventCommentCommand,
  ): EventComment {
    try {
      return EventComment.create({
        eventId: command.eventId,
        userId: command.userId,
        body: command.body,
      });
    } catch (error) {
      if (error instanceof EventCommentValidationError) {
        throw new CreateEventCommentValidationError(
          error.message,
          error.fields,
        );
      }

      throw error;
    }
  }
}
