import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: nodemailer.Transporter;

  /**
   * MailService constructor.
   * Sets up the nodemailer transporter using Gmail service and credentials from environment variables.
   */
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });
  }

  /**
   * Sends an email using the configured transporter.
   *
   */
  async sendMail(
    to: string,
    subject: string,
    text: string,
    html?: string,
  ): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: process.env.GMAIL_FROM || process.env.GMAIL_USER,
        to,
        subject,
        text,
        html,
      });
      this.logger.log(`Email sent to ${to} with subject "${subject}"`);
    } catch (error: unknown) {
      this.logger.error(
        `Failed to send email: ${error instanceof Error ? error.message : String(error)}`,
      );
      if (error instanceof Error && error.stack) {
        this.logger.error(error.stack);
      }
      throw error;
    }
  }
}
