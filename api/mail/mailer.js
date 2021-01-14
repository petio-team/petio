const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

class Mailer {
  constructor() {
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

  async _check() {
    try {
      let verify = await this.transport.verify();
      return verify;
    } catch (err) {
      return err;
    }
  }

  _transport() {
    const emailUser = this.config.emailUser;
    const emailPass = this.config.emailPass;
    const smtpServer = this.config.emailServer;
    const smtpPort = parseInt(this.config.emailPort);
    const secure = this.config.emailSecure ? true : false;
    console.log(this.config);

    const transporter = nodemailer.createTransport({
      host: smtpServer,
      port: smtpPort,
      secure: secure, // true for 465, false for other ports
      auth: {
        user: emailUser, // generated ethereal user
        pass: emailPass, // generated ethereal password
      },
    });

    return transporter;
  }

  mailHtml(title, text, img, user) {
    return `<html xmlns="http://www.w3.org/1999/xhtml" lang="en-GB"><head><meta name="color-scheme" content="light dark" /><link rel="preconnect" href="https://fonts.gstatic.com" /><meta http-equiv="Content-Type" content="text/html; charset=UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><link href="https://fonts.googleapis.com/css2?family=Khula:wght@700&family=Lato:wght@400;700&display=swap" rel="stylesheet" /></head><style>:root{color-scheme:light}*{box-sizing:border-box}body{font-family:'Lato',sans-serif}</style><body style="margin: 0; background: #282a2d"><table border="0" cellpadding="0" cellspacing="0" width="100%" style=" background: linear-gradient( 135deg, #333b3a, #374141 25%, #40362b 75%, #211a17 ); background-size: cover; background-repeat: no-repeat; " ><tr><td><table class="main-container" align="center" border="1" cellpadding="0" cellspacing="0" width="100%" style=" border-collapse: collapse; border: solid 0px transparent; " ><tr><td style="background: #282a2d; padding: 0px"><div style="height: 55px; padding: 16px 10px"><p style=" text-transform: uppercase; font-size: 32px; line-height: 1; color: #fff; font-family: 'Khula', sans-serif; margin: 0; text-align: center; " > Pet<span style="color: #e5a00d" >io</span ></p></div></td></tr><tr><td style="padding: 20px"><p style=" color: #fff; font-size: 12px; line-height: 18px; font-weight: 500; " > Hi ${user},</p><h1 style=" font-size: 24px; line-height: 30px; font-weight: 700; margin-bottom: 0; margin-top: 0; color: #fff; " > ${title}</h1><p style=" color: #fff; font-size: 12px; line-height: 18px; margin-bottom: 25px; font-weight: 500; " > ${text}</p> ${
      img ? `<img style=" width: 300px; margin: 0 auto; display: block; max-width: 100%; " src="${img}" />` : ""
    }</td></tr></table></td></tr></table></body></html>`;
  }

  async test() {
    try {
      let verify = await this.verify();
      console.log(verify);
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
      console.log(err);
      return { result: false, error: err };
    }
  }

  mail(subject, title, text, img, to = []) {
    if (!this.config.emailEnabled) {
      console.log("Email disabled, skipping sending emails");
      return;
    }
    if (!this.transport) {
      console.log("Email not configured, skipping sending emails");
      return;
    }

    try {
      to.forEach((send, i) => {
        let timeout = i * 2000;
        i++;
        setTimeout(() => {
          console.log(`Sending email from: ${this.config.emailUser} to ${send} with the subject ${subject}`);
          this.transport.sendMail({
            from: `"Petio" <${this.config.emailUser}>`,
            to: [send, this.adminEmail],
            subject: subject,
            html: this.mailHtml(title, text, img, send),
            text: text,
            onError: (e) => console.log(e),
            onSuccess: (i) => console.log("Message sent: %s", i.messageId),
          });
        }, timeout); //timeout between emails
      });
    } catch (err) {
      console.log("Email failed");
      console.log(err);
    }
  }
}

module.exports = Mailer;
