import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { createParamDecorator } from '@nestjs/common';

export const TenantContext = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const tenant = request.tenant;
    return data ? tenant?.[data] : tenant;
  },
);

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    const tenantId =
      request.headers['x-tenant-id'] || request.user?.tenantId;

    if (!tenantId) {
      throw new UnauthorizedException('Tenant context required');
    }

    request.tenant = {
      tenantId,
      institutionId: request.user?.institutionId,
      userId: request.user?.sub,
      roles: request.user?.roles || [],
      permissions: request.user?.permissions || [],
    };

    return true;
  }
}