import { Inject, Injectable } from '@nestjs/common';
import {
  EVENT_COMMENT_REPOSITORY,
  type EventCommentRepositoryPort,
} from '../../domain';
import { DeleteEventCommentValidationError } from '../errors/delete-event-comment-validation.error';
import { EventCommentNotFoundError } from '../errors/event-comment-not-found.error';
import type {
  DeleteEventCommentCommand,
  DeleteEventCommentPort,
} from '../ports/inbound/delete-event-comment.port';

@Injectable()
export class DeleteEventCommentUseCase implements DeleteEventCommentPort {
  constructor(
    @Inject(EVENT_COMMENT_REPOSITORY)
    private readonly eventCommentRepository: EventCommentRepositoryPort,
  ) {}

  async execute(command: DeleteEventCommentCommand): Promise<void> {
    if (!command.commentId?.trim()) {
      throw new DeleteEventCommentValidationError('Comentario inválido', [
        'commentId',
      ]);
    }

    const deleted = await this.eventCommentRepository.softDelete(
      command.userId,
      command.eventId,
      command.commentId,
      new Date(),
    );

    if (!deleted) {
      throw new EventCommentNotFoundError();
    }
  }
}
