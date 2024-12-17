import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { AuthRoles } from './authRoles.enum';
import { IUserInfo } from 'src/auth/interfaces';

@Injectable()
export class RolesGuard implements CanActivate {
  private jwtRolesKey = `${this.configService.get('JWT_CUSTOM_NAMESPACE')}/roles`;
  constructor(
    private readonly reflector: Reflector,
    private readonly configService: ConfigService,
  ) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const routeRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );
    const userInfo: IUserInfo = context.getArgs()[0].user;

    if (!routeRoles || routeRoles.includes(AuthRoles.WORKER)) {
      request['userInfo'] = userInfo;
      return true;
    }

    const userRoles = userInfo[this.jwtRolesKey] as string[];

    const hasRoles = () =>
      routeRoles.some((routeRole) => userRoles.includes(routeRole));

    if (hasRoles()) {
      request['userInfo'] = userInfo;
    }

    return hasRoles();
  }
}