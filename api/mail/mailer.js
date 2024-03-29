const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
const logger = require("../util/logger");

class Mailer {
  constructor() {
    // Load configs
    let project_folder, configFile, mconfigFile;
    if (process.pkg) {
      project_folder = path.dirname(process.execPath);
      configFile = path.join(project_folder, "./config/email.json");
      mconfigFile = path.join(project_folder, "./config/config.json");
    } else {
      project_folder = __dirname;
      configFile = path.join(project_folder, "../config/email.json");
      mconfigFile = path.join(project_folder, "../config/config.json");
    }
    const configData = fs.readFileSync(configFile);
    const configParse = JSON.parse(configData);
    this.config = configParse;
    const mainConfigData = fs.readFileSync(mconfigFile);
    const mainConfigParse = JSON.parse(mainConfigData);
    this.mainConfig = mainConfigParse;
    this.adminEmail = this.mainConfig.adminEmail;
    this.transport = this._transport();
    this.verify = this._check;
  }

  // Validate mail settings
  async _check() {
    try {
      let verify = await this.transport.verify();
      if (!this.config.emailFrom) throw "No From Email set";
      return verify;
    } catch (err) {
      return err;
    }
  }

  // Build mail transport
  _transport() {
    const emailUser = this.config.emailUser;
    const emailPass = this.config.emailPass;
    const smtpServer = this.config.emailServer;
    const smtpPort = parseInt(this.config.emailPort);
    const secure = this.config.emailSecure ? true : false;

    const transporter = nodemailer.createTransport({
      host: smtpServer,
      port: smtpPort,
      secure: secure, // true for 465, false for other ports
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });

    return transporter;
  }

  // HTML Email minfied, full version in html file
  mailHtml(title, text, img, user) {
    return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:v="urn:schemas-microsoft-com:vml"><head> <!--[if gte mso 9 ]><xml ><o:OfficeDocumentSettings><o:AllowPNG /><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml ><! [endif]--><meta content="text/html; charset=utf-8" http-equiv="Content-Type" /><meta name="color-scheme" content="light dark" /><meta content="width=device-width" name="viewport" /><link href="https://fonts.googleapis.com/css2?family=Khula:wght@700&family=Lato:wght@400;700&display=swap" rel="stylesheet" /> <!--[if !mso]><!--><meta content="IE=edge" http-equiv="X-UA-Compatible" /> <!--<![endif]--><title></title> <!--[if !mso]><!--> <!--<![endif]--><style type="text/css">body{margin:0;padding:0}table,td,tr{vertical-align:top;border-collapse:collapse}*{line-height:inherit}a[x-apple-data-detectors="true"]{color:inherit !important;text-decoration:none !important}</style><style id="media-query" type="text/css">@media (max-width: 520px){.block-grid,.col{min-width:320px !important;max-width:100% !important;display:block !important}.block-grid{width:100% !important}.col{width:100% !important}.col_cont{margin:0 auto}img.fullwidth,img.fullwidthOnMobile{max-width:100% !important}.no-stack .col{min-width:0 !important;display:table-cell !important}.no-stack.two-up .col{width:50% !important}.no-stack .col.num2{width:16.6% !important}.no-stack .col.num3{width:25% !important}.no-stack .col.num4{width:33% !important}.no-stack .col.num5{width:41.6% !important}.no-stack .col.num6{width:50% !important}.no-stack .col.num7{width:58.3% !important}.no-stack .col.num8{width:66.6% !important}.no-stack .col.num9{width:75% !important}.no-stack .col.num10{width:83.3% !important}.video-block{max-width:none !important}.mobile_hide{min-height:0px;max-height:0px;max-width:0px;display:none;overflow:hidden;font-size:0px}.desktop_hide{display:block !important;max-height:none !important}}</style><style id="icon-media-query" type="text/css">@media (max-width: 520px){.icons-inner{text-align:center}.icons-inner td{margin:0 auto}}</style></head><body class="clean-body" style="margin: 0; padding: 0; -webkit-text-size-adjust: 100%; background-color: #ffffff"> <!--[if IE]><div class="ie-browser"><![endif]--><table bgcolor="#FFFFFF" cellpadding="0" cellspacing="0" class="nl-container" role="presentation" style=" table-layout: fixed; vertical-align: top; min-width: 320px; border-spacing: 0; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #ffffff; width: 100%; " valign="top" width="100%" ><tbody><tr style="vertical-align: top" valign="top"><td style="word-break: break-word; vertical-align: top" valign="top"> <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="background-color:#FFFFFF"><![endif]--><div style="background-color: #282a2d"><div class="block-grid" style="min-width: 320px; max-width: 500px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; margin: 0 auto; background-color: transparent" ><div style="border-collapse: collapse; display: table; width: 100%; background-color: transparent"> <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#282a2d;"><tr><td align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:500px"><tr class="layout-full-width" style="background-color:transparent"><![endif]--> <!--[if (mso)|(IE)]><td align="center" width="500" style="background-color:transparent;width:500px; border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent;" valign="top"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-right: 0px; padding-left: 0px; padding-top:5px; padding-bottom:5px;"><![endif]--><div class="col num12" style="min-width: 320px; max-width: 500px; display: table-cell; vertical-align: top; width: 500px"><div class="col_cont" style="width: 100% !important"> <!--[if (!mso)&(!IE)]><!--><div style=" border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent; padding-top: 5px; padding-bottom: 5px; padding-right: 0px; padding-left: 0px; " > <!--<![endif]--> <!--[if mso]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-right: 10px; padding-left: 10px; padding-top: 10px; padding-bottom: 10px; font-family: Arial, sans-serif"><![endif]--><div style="color: #555555; font-family: Lato, Helvetica, sans-serif; line-height: 1.2; padding-top: 10px; padding-right: 10px; padding-bottom: 10px; padding-left: 10px"><div style="line-height: 1.2; font-size: 12px; font-family: Lato, Helvetica, sans-serif; color: #555555; mso-line-height-alt: 14px"><p style="text-transform: uppercase; font-size: 32px; line-height: 1; color: #fff; font-family: 'Khula', sans-serif; margin: 0; text-align: center"> <span style="color: #ffffff">Pet<span style="color: #e5a00d">io</span></span></p></div></div> <!--[if mso]></td></tr></table><![endif]--> <!--[if (!mso)&(!IE)]><!--></div> <!--<![endif]--></div></div> <!--[if (mso)|(IE)]></td></tr></table><![endif]--> <!--[if (mso)|(IE)]></td></tr></table></td></tr></table><![endif]--></div></div></div><div style="background-color: #333b3a; background: linear-gradient(135deg, #333b3a, #374141 25%, #40362b 75%, #211a17); background-size: cover; background-repeat: no-repeat"><div class="block-grid" style="min-width: 320px; max-width: 500px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; margin: 0 auto; background-color: transparent" ><div style="border-collapse: collapse; display: table; width: 100%; background-color: transparent"> <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#333b3a;"><tr><td align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:500px"><tr class="layout-full-width" style="background-color:transparent"><![endif]--> <!--[if (mso)|(IE)]><td align="center" width="500" style="background-color:transparent;width:500px; border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent;" valign="top"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-right: 0px; padding-left: 0px; padding-top:5px; padding-bottom:5px;"><![endif]--><div class="col num12" style="min-width: 320px; max-width: 500px; display: table-cell; vertical-align: top; width: 500px"><div class="col_cont" style="width: 100% !important"> <!--[if (!mso)&(!IE)]><!--><div style=" border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent; padding-top: 5px; padding-bottom: 5px; padding-right: 0px; padding-left: 0px; " > <!--<![endif]--> <!--[if mso]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-right: 10px; padding-left: 10px; padding-top: 10px; padding-bottom: 10px; font-family: Arial, sans-serif"><![endif]--><div style="color: #555555; font-family: Lato, Helvetica, sans-serif; line-height: 1.2; padding-top: 10px; padding-right: 10px; padding-bottom: 10px; padding-left: 10px"><div style="line-height: 1.2; font-size: 12px; color: #555555; font-family: Lato, Helvetica, sans-serif; mso-line-height-alt: 14px"><p style="text-align: center; font-size: 12px; line-height: 18px; font-weight: 500"><span style="color: #ffffff">Hi ${user},</span></p></div></div> <!--[if mso]></td></tr></table><![endif]--> <!--[if mso]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-right: 10px; padding-left: 10px; padding-top: 10px; padding-bottom: 10px; font-family: Arial, sans-serif"><![endif]--><div style="color: #555555; font-family: Lato, Helvetica, sans-serif; line-height: 1.2; padding-top: 10px; padding-right: 10px; padding-bottom: 10px; padding-left: 10px"><div style="line-height: 1.2; font-size: 12px; color: #555555; font-family: Lato, Helvetica, sans-serif; mso-line-height-alt: 14px"><h1 style="text-align: center; font-size: 24px; line-height: 30px; font-weight: 700; margin-bottom: 0; margin-top: 0; color: #fff">${title}</h1><p style="text-align: center; color: #fff; font-size: 12px; line-height: 18px; margin-bottom: 25px; font-weight: 500">${text}</p></div></div> <!--[if mso]></td></tr></table><![endif]--> <!--[if mso]></td></tr></table><![endif]--> <!--[if mso]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-right: 10px; padding-left: 10px; padding-top: 10px; padding-bottom: 10px; font-family: Arial, sans-serif"><![endif]--><div style="color: #555555; font-family: Lato, Helvetica, sans-serif; line-height: 1.2; padding-top: 10px; padding-right: 10px; padding-bottom: 10px; padding-left: 10px"><div style="line-height: 1.2; font-size: 12px; color: #555555; font-family: Lato, Helvetica, sans-serif; mso-line-height-alt: 14px"> ${
      img
        ? `<img style="width: 300px; margin: 0 auto; display: block; max-width: 100%" src="${img}" />`
        : ""
    }</div></div> <!--[if mso]></td></tr></table><![endif]--> <!--[if (!mso)&(!IE)]><!--></div> <!--<![endif]--></div></div> <!--[if (mso)|(IE)]></td></tr></table><![endif]--> <!--[if (mso)|(IE)]></td></tr></table></td></tr></table><![endif]--></div></div></div><div style="background-color: transparent"><div class="block-grid" style="min-width: 320px; max-width: 500px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; margin: 0 auto; background-color: transparent" ><div style="border-collapse: collapse; display: table; width: 100%; background-color: transparent"> <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:transparent;"><tr><td align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:500px"><tr class="layout-full-width" style="background-color:transparent"><![endif]--> <!--[if (mso)|(IE)]><td align="center" width="500" style="background-color:transparent;width:500px; border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent;" valign="top"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-right: 0px; padding-left: 0px; padding-top:5px; padding-bottom:5px;"><![endif]--><div class="col num12" style="min-width: 320px; max-width: 500px; display: table-cell; vertical-align: top; width: 500px"><div class="col_cont" style="width: 100% !important"> <!--[if (!mso)&(!IE)]><!--><div style=" border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent; padding-top: 5px; padding-bottom: 5px; padding-right: 0px; padding-left: 0px; " > <!--<![endif]--><table cellpadding="0" cellspacing="0" role="presentation" style="table-layout: fixed; vertical-align: top; border-spacing: 0; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt" valign="top" width="100%" ><tr style="vertical-align: top" valign="top"><td align="center" style="word-break: break-word; vertical-align: top; padding-top: 5px; padding-right: 0px; padding-bottom: 5px; padding-left: 0px; text-align: center" valign="top" > <!--[if vml]><table align="left" cellpadding="0" cellspacing="0" role="presentation" style="display:inline-block;padding-left:0px;padding-right:0px;mso-table-lspace: 0pt;mso-table-rspace: 0pt;"><![endif]--> <!--[if !vml]><!--><table cellpadding="0" cellspacing="0" class="icons-inner" role="presentation" style=" table-layout: fixed; vertical-align: top; border-spacing: 0; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; display: inline-block; margin-right: -4px; padding-left: 0px; padding-right: 0px; " valign="top" > <!--<![endif]--><tr style="vertical-align: top" valign="top"><td style="word-break: break-word; font-family: Lato, Helvetica, sans-serif; font-size: 15px; color: #9d9d9d; vertical-align: middle" valign="middle"> <a href="https://petio.tv/" style="color: #e5a00d; text-decoration: none">Powered by Petio</a></td></tr></table></td></tr></table> <!--[if (!mso)&(!IE)]><!--></div> <!--<![endif]--></div></div> <!--[if (mso)|(IE)]></td></tr></table><![endif]--> <!--[if (mso)|(IE)]></td></tr></table></td></tr></table><![endif]--></div></div></div> <!--[if (mso)|(IE)]></td></tr></table><![endif]--></td></tr></tbody></table> <!--[if (IE)]></div><![endif]--></body></html>`;
  }

  // Validate mail settings
  async test() {
    try {
      let verify = await this.verify();
      this.mail(
        "Petio Test Email",
        "This is a test",
        "If you're seeing this email then your Petio email settings are correct!",
        false,
        [this.adminEmail]
      );
      logger.log("verbose", "MAILER: Verified");
      if (verify === true) {
        return {
          result: true,
          error: false,
        };
      } else {
        return {
          result: false,
          error: verify,
        };
      }
    } catch (err) {
      logger.log("warn", "MAILER: Verification failed");
      logger.log({ level: "error", message: err });
      return { result: false, error: err };
    }
  }

  // Build email and send to transport
  mail(subject, title, text, img, to = [], name = []) {
    if (!this.config.emailEnabled) {
      logger.log("warn", "MAILER: Email disabled, skipping sending emails");
      return;
    }
    if (!this.transport) {
      logger.log(
        "warn",
        "MAILER: Email not configured, skipping sending emails"
      );
      return;
    }

    try {
      // Send mail
      to.forEach((send, i) => {
        let timeout = i * 2000; //timeout between emails to avoid quota
        let username = name[i] || "";
        i++;
        setTimeout(async () => {
          logger.log(
            "info",
            `MAILER: Sending email from: ${this.config.emailFrom} to ${send} with the subject ${subject}`
          );
          try {
            await this.transport.sendMail({
              from: `"Petio" <${this.config.emailFrom}>`,
              to: `${username} <${send}>`,
              bcc: this.adminEmail,
              subject: subject,
              html: this.mailHtml(title, text, img, username),
              text: text,
              onError: (e) => {
                logger.log("warn", `MAILER: Message failed to send`);
                logger.log("error", e);
              },
              onSuccess: (s) =>
                logger.log("info", "MAILER: Message sent: %s", s.messageId),
            });
          } catch (err) {
            logger.error(err.response);
            logger.log("warn", `MAILER: Message failed to send`);
          }
        }, timeout);
      });
    } catch (err) {
      logger.log("warn", "MAILER: Email failed");
      logger.log({ level: "error", message: err });
    }
  }
}

module.exports = Mailer;
