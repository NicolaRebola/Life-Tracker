import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CreateEventUseCase } from '../application/create-event-use-case';
import { CreateEventValidationError } from '../application/create-event.errors';
import { SessionGuard } from 'src/modules/session/application/session.guard';
import type { AuthenticatedRequest } from 'src/modules/session/application/session.guard';
import type { CreateEventDto } from './dto/create-event.dto';

@Controller('events')
export class EventController {
  constructor(private readonly createEventUseCase: CreateEventUseCase) {}

  @UseGuards(SessionGuard)
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
}
