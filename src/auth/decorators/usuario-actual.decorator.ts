import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { UsuarioToken } from '../interfaces/usuario-token.interface';

export const UsuarioActual = createParamDecorator(
  (_data: unknown, context: ExecutionContext): UsuarioToken => {
    const request = context
      .switchToHttp()
      .getRequest<Request & { usuario: UsuarioToken }>();
    return request.usuario;
  },
);