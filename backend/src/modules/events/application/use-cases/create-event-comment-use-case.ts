import { Inject, Injectable } from '@nestjs/common';
import {
  EVENT_COMMENT_REPOSITORY,
  EVENT_REPOSITORY,
  EventComment,
  EventCommentValidationError,
  type EventActor,
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
    const actor = this.resolveActor(command);
    const event =
      actor.type === 'OWNER'
        ? await this.eventRepository.findByIdForOwner(
            actor.userId,
            command.eventId,
          )
        : await this.eventRepository.findByIdForParticipant(
            actor.participantId,
            command.eventId,
          );

    if (!event) {
      throw new EventNotFoundError();
    }

    const comment = this.createDomainComment(command);
    const savedComment = await this.eventCommentRepository.save(comment);

    return {
      comment: toEventCommentListItem(savedComment, actor),
    };
  }

  private createDomainComment(
    command: CreateEventCommentCommand,
  ): EventComment {
    try {
      return EventComment.create({
        eventId: command.eventId,
        userId: command.userId,
        participantId: command.participantId,
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

  private resolveActor(command: CreateEventCommentCommand): EventActor {
    if (command.userId) {
      return { type: 'OWNER', userId: command.userId };
    }

    if (command.participantId) {
      return {
        type: 'PARTICIPANT',
        participantId: command.participantId,
        email: '',
      };
    }

    throw new CreateEventCommentValidationError('Autor inválido', [
      'userId',
      'participantId',
    ]);
  }
}
