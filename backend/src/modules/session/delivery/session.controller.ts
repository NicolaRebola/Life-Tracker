import { Body, Controller, Post, Req } from "@nestjs/common";
import { LoginUseCase } from "../application/login-use-case";
import { LoginDTO } from "./dto/login.dto";

@Controller('session')
export class SessionController {
  constructor(private readonly login: LoginUseCase) {}

  @Post('google/start')
  async googleStart(@Body() body: LoginDTO, @Req() req: Request) {
    return this.login.execute(body);
  }
}