import { Body, Controller, Inject, Post } from '@nestjs/common';
import { LOGIN, type LoginPort } from '../application/ports/inbound/login.port';
import { LoginDTO } from './dto/login.dto';

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
}
