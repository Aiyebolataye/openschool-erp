import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class TenantAwareJwtGuard extends AuthGuard('jwt') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const result = (await super.canActivate(context)) as boolean;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    const headerTenant = request.headers['x-tenant-id'];
    if (headerTenant && headerTenant !== user.tenantId) {
      throw new UnauthorizedException('Tenant mismatch');
    }

    request.tenant = {
      tenantId: user.tenantId,
      institutionId: user.institutionId,
      userId: user.sub,
      roles: user.roles,
    };

    return result;
  }
}