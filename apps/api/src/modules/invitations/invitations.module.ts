import { Module } from '@nestjs/common';
import { DeliveryModule } from '../delivery/delivery.module';
import { InvitationsService } from './invitations.service';
import { InvitationsController, PublicInvitationsController } from './invitations.controller';

@Module({
  imports: [DeliveryModule],
  controllers: [InvitationsController, PublicInvitationsController],
  providers: [InvitationsService],
  exports: [InvitationsService],
})
export class InvitationsModule {}