import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { RolUsuario } from '../../usuarios/enums/rol-usuario.enum';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { UsuarioToken } from '../interfaces/usuario-token.interface';

interface PayloadToken {
  sub: number;
  rol: RolUsuario;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const esPublico = this.reflector.getAllAndOverride<boolean>(
      IS_PUBLIC_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (esPublico) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<Request & { usuario?: UsuarioToken }>();
    const token = this.extraerToken(request);
    if (!token) {
      throw new UnauthorizedException('Token no enviado');
    }

    try {
      const payload = await this.jwtService.verifyAsync<PayloadToken>(token);
      request.usuario = { id: payload.sub, rol: payload.rol };
    } catch {
      throw new UnauthorizedException('Token inválido o vencido');
    }
    return true;
  }

  private extraerToken(request: Request): string | undefined {
    const [tipo, token] = request.headers.authorization?.split(' ') ?? [];
    return tipo === 'Bearer' ? token : undefined;
  }
}