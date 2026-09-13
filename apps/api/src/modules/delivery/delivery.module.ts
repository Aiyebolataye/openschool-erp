import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DELIVERY_PROVIDER,
  resolveDeliveryProviderName,
} from './delivery-provider';
import { DevDeliveryProvider } from './dev-delivery.provider';
import { NoOpDeliveryProvider } from './no-op-delivery.provider';

@Module({
  providers: [
    {
      provide: DELIVERY_PROVIDER,
      useFactory: (config: ConfigService) => {
        const name = resolveDeliveryProviderName(
          config.get<string>('env', 'development'),
          config.get<string>('delivery.provider', 'dev'),
        );
        return name === 'none' ? new NoOpDeliveryProvider() : new DevDeliveryProvider();
      },
      inject: [ConfigService],
    },
  ],
  exports: [DELIVERY_PROVIDER],
})
export class DeliveryModule {}