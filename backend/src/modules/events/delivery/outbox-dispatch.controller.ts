import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Inject,
  Post,
  UseGuards,
} from '@nestjs/common';
import { DISPATCH_OUTBOX_MESSAGES } from '../application/ports/inbound/dispatch-outbox-messages.port';
import { InternalJobGuard } from '../application/internal-job.guard';
import type { DispatchOutboxMessagesPort } from '../application/ports/inbound/dispatch-outbox-messages.port';
import type { DispatchOutboxMessagesDto } from './dto/dispatch-outbox-messages.dto';

const DEFAULT_DISPATCH_LIMIT = 10;
const MAX_DISPATCH_LIMIT = 100;

@Controller('internal/outbox')
@UseGuards(InternalJobGuard)
export class OutboxDispatchController {
  constructor(
    @Inject(DISPATCH_OUTBOX_MESSAGES)
    private readonly dispatchOutboxMessagesUseCase: DispatchOutboxMessagesPort,
  ) {}

  @Post('dispatch')
  @HttpCode(200)
  async dispatch(@Body() body: DispatchOutboxMessagesDto | undefined) {
    const limit = this.parseLimit(body?.limit);

    return this.dispatchOutboxMessagesUseCase.execute({ limit });
  }

  private parseLimit(value: number | undefined): number {
    if (value === undefined) {
      return DEFAULT_DISPATCH_LIMIT;
    }

    if (!Number.isInteger(value) || value < 1 || value > MAX_DISPATCH_LIMIT) {
      throw new HttpException(
        {
          message: `limit must be an integer between 1 and ${MAX_DISPATCH_LIMIT}`,
          fields: ['limit'],
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    return value;
  }
}
