import { Global, Module } from '@nestjs/common';
import { PaystackService } from './paystack.service';

@Global()
@Module({
  exports: [PaystackService],
  providers: [PaystackService],
})
export class PaystackModule {}
