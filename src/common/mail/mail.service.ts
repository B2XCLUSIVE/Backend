import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';


@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async forgotPassword(user,otp: string) {
    
    const url = `noSlag.com/forgotpassword/confirm?otp=${otp}`;

    await this.mailerService
      .sendMail({
        to: user.email,
        subject: 'Welcome to Parcel! reset your password',
        template: './forgotPassword',
        context: {
          firstName: user.firstName,
          lastName: user.lastName,
          url,
          otp,
        },
      })
      .then((success) => {
        console.log(success);
      })
      .catch((err) => {
        console.log(err);
      });
  }
}
