import { Injectable } from '@nestjs/common';
import { createTransport } from 'nodemailer';
import * as dotenv from 'dotenv';
dotenv.config();
@Injectable()
export class MailerService {
  private transporter;

  constructor() {
    this.transporter = createTransport({
      service: 'gmail', // Use your email service
      auth: {
        user: process.env.EMAIL_USER, // Your email address
        pass: process.env.EMAIL_PASS, // Your email password or app password
      },
    });
  }

  async sendMail(to: string, subject: string, text: string) {
    await this.transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    });
  }
}
