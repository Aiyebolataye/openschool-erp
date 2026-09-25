import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface ActorContext {
  id: string;
  tenantId: string;
  institutionId?: string | null;
  roles: string[];
}

export const CurrentActor = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): ActorContext => {
    const request = ctx.switchToHttp().getRequest();
    return request.actor ?? {
      id: request.user?.sub ?? '',
      tenantId: request.user?.tenantId ?? '',
      institutionId: request.user?.institutionId ?? null,
      roles: request.user?.roles ?? [],
    };
  },
);
