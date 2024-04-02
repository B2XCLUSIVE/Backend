import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const Paystack = require('paystack');

@Injectable()
export class PaystackService {
  private readonly paystack = Paystack;

  constructor(private configService: ConfigService) {
    this.paystack = Paystack(this.configService.get<string>('TEST_SECRET'));
  }

  async initiatePayment(
    userId: number,
    walletId: number,
    // fundWalletDto: FundWalletDto,
  ) {
    try {
      //const baseUrl = 'https://checkout.paystack.com';
      //const { amount, email } = fundWalletDto;
      // const response = await this.paystack.transaction.initialize({
      //   amount: amount * 100,
      //   email,
      //   //redirect_url: `${baseUrl}\wallet\callback`,
      //   metadata: {
      //     userId,
      //     walletId,
      //     amount,
      //   },
      // });
      // return response;
    } catch (error) {
      return new HttpException(
        `${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async verifyPayment(reference: string) {
    try {
      const response = await this.paystack.transaction.verify(reference);
      return response.data;
    } catch (error) {
      return new HttpException(
        `${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
