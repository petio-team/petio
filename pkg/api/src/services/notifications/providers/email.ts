import mjml2html from 'mjml';
import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

import { BaseNotification, INotification } from '../notification';
import { INotify, NotifyEvent, NotifyPayload } from '../notify';
import { renderRequestTemplate } from '../templates/email/template';
import { AuthConfig } from '../url/url';

export interface EmailNotification extends INotification {
  host: string;
  port: number;
  username: string;
  password: string;
  from: string;
  secure: boolean;
}

export class EmailProvider
  extends BaseNotification<EmailNotification>
  implements INotify
{
  private instance: nodemailer.Transporter;

  constructor(config: EmailNotification) {
    super(config);

    const options: SMTPTransport.Options = {
      host: this.config.host,
      port: this.config.port,
      secure: this.config.secure,
      auth: {
        user: this.config.username,
        pass: this.config.password,
      },
    };

    this.instance = nodemailer.createTransport(options);
  }

  async Send(type: NotifyEvent, data: NotifyPayload): Promise<void> {
    const verify = this.instance.verify();
    if (!verify) {
      throw new Error('failed to very smtp config');
    }

    const template = renderRequestTemplate(type, data);
    const html = mjml2html(template, {
      minify: true,
    });

    await this.instance.sendMail({
      html: html.html,
    });
  }
}

export const authConfigToEmailSettings = (
  url: AuthConfig,
): EmailNotification => {
  const settings = {} as EmailNotification;

  settings.host = url.arguments.source || 'localhost';
  settings.port = url.arguments.value ? parseInt(url.arguments.value) : 25;
  settings.username = url.arguments.identifier || '';
  settings.password = url.arguments.secret || '';
  settings.from = url.options['from'] || 'Petio';

  if (url.options['secure']) {
    settings.secure = true;
  }

  return settings;
};
