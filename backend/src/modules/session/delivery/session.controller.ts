import { Body, Controller, Post } from '@nestjs/common';
import { LoginUseCase } from '../application/login-use-case';
import { LoginDTO } from './dto/login.dto';

@Controller('session')
export class SessionController {
  constructor(private readonly login: LoginUseCase) {}

  @Post('google/start')
  async googleStart(@Body() body: LoginDTO) {
    return this.login.execute(body);
  }
}
