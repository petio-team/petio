import mjml2html from 'mjml';
import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

import { SMTPNotificationProps } from '@/resources/notification/types';
import { BaseNotificationProvider } from '@/services/notifications/base-provider';
import { NotifyEvent, NotifyPayload } from '@/services/notifications/types';

import { renderTemplate } from './template';

export class SMTPNotificationProvider extends BaseNotificationProvider<SMTPNotificationProps> {
  private transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo>;

  constructor(notification: SMTPNotificationProps) {
    super(notification);
    this.transporter = nodemailer.createTransport({
      host: notification.metadata.host,
      port: notification.metadata.port,
      secure: notification.metadata.secure,
      auth: {
        user: notification.metadata.username,
        pass: notification.metadata.password,
      },
    });
  }

  async sendNotification(
    type: NotifyEvent,
    data: NotifyPayload,
  ): Promise<void> {
    const html = mjml2html(renderTemplate(type, data));
    await this.transporter.sendMail({
      from: this.notification.metadata.from,
      to: data.user?.email,
      subject: 'Petio Notification',
      html: html.html,
    });
  }
}
