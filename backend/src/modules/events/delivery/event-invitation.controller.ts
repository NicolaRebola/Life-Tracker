import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Inject,
  Param,
  Post,
} from '@nestjs/common';
import { ACCEPT_EVENT_INVITATION } from '../application/ports/inbound/accept-event-invitation.port';
import { EventInvitationExpiredError } from '../application/errors/event-invitation-expired.error';
import { EventInvitationNotFoundError } from '../application/errors/event-invitation-not-found.error';
import type { AcceptEventInvitationPort } from '../application/ports/inbound/accept-event-invitation.port';
import type { AcceptEventInvitationDto } from './dto/accept-event-invitation.dto';

@Controller('event-invitations')
export class EventInvitationController {
  constructor(
    @Inject(ACCEPT_EVENT_INVITATION)
    private readonly acceptEventInvitationUseCase: AcceptEventInvitationPort,
  ) {}

  @Post(':token/accept')
  async acceptInvitation(
    @Param('token') token: string,
    @Body() body: AcceptEventInvitationDto,
  ) {
    try {
      return await this.acceptEventInvitationUseCase.execute({
        token,
        displayName: body.displayName,
      });
    } catch (error) {
      if (error instanceof EventInvitationExpiredError) {
        throw new HttpException({ message: error.message }, HttpStatus.GONE);
      }

      if (error instanceof EventInvitationNotFoundError) {
        throw new HttpException(
          { message: error.message },
          HttpStatus.NOT_FOUND,
        );
      }

      throw error;
    }
  }
}
