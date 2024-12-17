import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { AuthRoles } from 'src/auth/authRoles.enum';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  handleRequest(err, user, info, ctx) {
    const routeRoles = this.reflector.get<string[]>('roles', ctx.getHandler());
    if (routeRoles && routeRoles.includes(AuthRoles.WORKER)) {
      return user;
    }

    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
