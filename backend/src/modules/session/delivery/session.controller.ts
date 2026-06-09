import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { LOGIN, type LoginPort } from '../application/ports/inbound/login.port';
import { LoginDTO } from './dto/login.dto';
import {
  type AuthenticatedRequest,
  SessionGuard,
} from '../application/session.guard';

@Controller('session')
export class SessionController {
  constructor(
    @Inject(LOGIN)
    private readonly login: LoginPort,
  ) {}

  @Post('google/start')
  async googleStart(@Body() body: LoginDTO) {
    return this.login.execute(body);
  }

  @Get('current')
  @UseGuards(SessionGuard)
  current(@Req() req: AuthenticatedRequest) {
    return {
      user: req.user,
      session: req.session,
    };
  }
}
