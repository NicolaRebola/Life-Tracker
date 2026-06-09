import { Inject, Injectable } from '@nestjs/common';
import {
  EVENT_COMMENT_REPOSITORY,
  EVENT_REPOSITORY,
  type EventActor,
  type EventCommentRepositoryPort,
  type EventRepositoryPort,
} from '../../domain';
import { EventNotFoundError } from '../errors/event-not-found.error';
import { toEventCommentListItem } from '../mappers/event-comment.mapper';
import type {
  ListEventCommentsCommand,
  ListEventCommentsPort,
  ListEventCommentsResult,
} from '../ports/inbound/list-event-comments.port';

@Injectable()
export class ListEventCommentsUseCase implements ListEventCommentsPort {
  constructor(
    @Inject(EVENT_REPOSITORY)
    private readonly eventRepository: EventRepositoryPort,
    @Inject(EVENT_COMMENT_REPOSITORY)
    private readonly eventCommentRepository: EventCommentRepositoryPort,
  ) {}

  async execute(
    command: ListEventCommentsCommand,
  ): Promise<ListEventCommentsResult> {
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

    const comments =
      actor.type === 'OWNER'
        ? await this.eventCommentRepository.findManyByEventForUser(
            actor.userId,
            command.eventId,
          )
        : await this.eventCommentRepository.findManyByEventForParticipant(
            actor.participantId,
            command.eventId,
          );

    return {
      items: comments.map((comment) => toEventCommentListItem(comment, actor)),
    };
  }

  private resolveActor(command: ListEventCommentsCommand): EventActor {
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

    throw new EventNotFoundError();
  }
}
