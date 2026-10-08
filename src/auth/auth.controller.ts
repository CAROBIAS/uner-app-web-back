import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { UsuarioActual } from './decorators/usuario-actual.decorator';
import { LoginDto } from './dto/login.dto';
import {
  LoginResponseDto,
  UsuarioAutenticadoDto,
} from './dto/login-response.dto';
import type { UsuarioToken } from './interfaces/usuario-token.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    return this.authService.login(loginDto);
  }

  @Get('perfil')
  perfil(
    @UsuarioActual() usuario: UsuarioToken,
  ): Promise<UsuarioAutenticadoDto> {
    return this.authService.perfil(usuario.id);
  }
}