import { Inject, Injectable } from '@nestjs/common';
import {
  EVENT_COMMENT_REPOSITORY,
  EVENT_REPOSITORY,
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

  async execute(command: ListEventCommentsCommand): Promise<ListEventCommentsResult> {
    const event = await this.eventRepository.findByIdForUser(
      command.userId,
      command.eventId,
    );

    if (!event) {
      throw new EventNotFoundError();
    }

    const comments = await this.eventCommentRepository.findManyByEventForUser(
      command.userId,
      command.eventId,
    );

    return {
      items: comments.map((comment) =>
        toEventCommentListItem(comment, command.userId),
      ),
    };
  }
}
