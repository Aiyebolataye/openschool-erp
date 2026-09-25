import { createParamDecorator, ExecutionContext } from '@nestjs/common';
export interface ActorContext { id: string; role: string; tenantId: string }
export const CurrentActor = createParamDecorator((_d: unknown, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest();
  return (req.actor ?? { id: '', role: '', tenantId: '' }) as ActorContext;
});
