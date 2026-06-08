import { Inject, Injectable } from '@nestjs/common';
import {
  EVENT_COMMENT_REPOSITORY,
  EventComment,
  EventCommentValidationError,
  type EventCommentRepositoryPort,
} from '../../domain';
import { EventCommentForbiddenError } from '../errors/event-comment-forbidden.error';
import { EventCommentNotFoundError } from '../errors/event-comment-not-found.error';
import { UpdateEventCommentValidationError } from '../errors/update-event-comment-validation.error';
import { toEventCommentListItem } from '../mappers/event-comment.mapper';
import type {
  UpdateEventCommentCommand,
  UpdateEventCommentPort,
  UpdateEventCommentResult,
} from '../ports/inbound/update-event-comment.port';

@Injectable()
export class UpdateEventCommentUseCase implements UpdateEventCommentPort {
  constructor(
    @Inject(EVENT_COMMENT_REPOSITORY)
    private readonly eventCommentRepository: EventCommentRepositoryPort,
  ) {}

  async execute(command: UpdateEventCommentCommand): Promise<UpdateEventCommentResult> {
    if (!command.commentId?.trim()) {
      throw new UpdateEventCommentValidationError('Comentario inválido', ['commentId']);
    }

    const existing = await this.eventCommentRepository.findByIdForUser(
      command.userId,
      command.eventId,
      command.commentId,
    );

    if (!existing) {
      throw new EventCommentNotFoundError();
    }

    if (existing.userId !== command.userId) {
      throw new EventCommentForbiddenError();
    }

    const updatedComment = this.updateDomainComment(existing, command.body);
    const savedComment = await this.eventCommentRepository.update(updatedComment);

    return {
      comment: toEventCommentListItem(savedComment, command.userId),
    };
  }

  private updateDomainComment(
    existing: { id: string; eventId: string; userId: string; body: string },
    body: string,
  ): EventComment {
    try {
      return EventComment.rehydrate({
        id: existing.id,
        eventId: existing.eventId,
        userId: existing.userId,
        body: existing.body,
      }).updateBody(body);
    } catch (error) {
      if (error instanceof EventCommentValidationError) {
        throw new UpdateEventCommentValidationError(error.message, error.fields);
      }

      throw error;
    }
  }
}
