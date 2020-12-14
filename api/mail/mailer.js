const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

class Mailer {
	constructor() {
		let project_folder, configFile;
		if (process.pkg) {
			project_folder = path.dirname(process.execPath);
			configFile = path.join(project_folder, './config/email.json');
		} else {
			project_folder = __dirname;
			configFile = path.join(project_folder, '../config/email.json');
		}
		const configData = fs.readFileSync(configFile);
		const configParse = JSON.parse(configData);
		this.config = configParse;
		this.adminEmail = this.config.adminEmail;
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

	mailHtml(title, text, img) {
		return `<style> @font-face { font-family: 'Open Sans'; font-style: normal; font-weight: 300; font-display: swap; src: local('Open Sans Light'), local('OpenSans-Light'), url(https://fonts.gstatic.com/s/opensans/v17/mem5YaGs126MiZpBA-UN_r8OUuhpKKSTjw.woff2) format('woff2'); unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD; } @font-face { font-family: 'Open Sans'; font-style: normal; font-weight: 400; font-display: swap; src: local('Open Sans Regular'), local('OpenSans-Regular'), url(https://fonts.gstatic.com/s/opensans/v17/mem8YaGs126MiZpBA-UFVZ0bf8pkAg.woff2) format('woff2'); unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD; } @font-face { font-family: 'Logo'; src: url(https://fonts.gstatic.com/s/khula/v7/OpNPnoEOns3V7G-1ixvSpi9fXBXC80c.woff2) format('woff2'); unicode-range: U+0900-097F, U+1CD0-1CF6, U+1CF8-1CF9, U+200C-200D, U+20A8, U+20B9, U+25CC, U+A830-A839, U+A8E0-A8FB; } :root { color-scheme: light; } </style> <table border="0" cellpadding="0" cellspacing="0" width="100%"> <tr> <td> <table class="main-container" align="center" border="1" cellpadding="0" cellspacing="0" width="300" style=" border-collapse: collapse; border: solid 1px #3f4245; background: linear-gradient( 135deg, #333b3a, #374141 25%, #40362b 75%, #211a17 ); background-size: cover; background-repeat: no-repeat; box-shadow: 0px -13px 20px 7px #0000007a; " > <tr> <td style=" background: #3f4245; color: white; padding: 10px; " > <p style=" text-transform: uppercase; font-size: 32px; line-height: 1; color: #fff; font-family: 'Logo', sans-serif; margin: 0; " > Pet<span style="color: #e5a00d;">io</span> </p> </td> </tr> <tr> <td style="padding: 20px;"> <h1 style=" font-size: 24px; line-height: 30px; font-weight: 700; margin-bottom: 0; margin-top: 0; color: #fff; " > ${title} </h1> <p style=" color: #fff; font-size: 12px; line-height: 18px; margin-bottom: 25px; font-weight: 500; " > ${text} </p> ${
			img
				? `<img style=" width: 300px; margin: 0 auto; display: block; max-width: 100%; " src="${img}" />`
				: ''
		} </td> </tr> </table> </td> </tr> </table>`;
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
			console.log('Email disabled, skipping sending emails');
			return;
		}
		if (!this.transport) {
			console.log('Email not configured, skipping sending emails');
			return;
		}

		try {
			to.forEach((send, i) => {
				let timeout = i * 2000;
				i++;
				setTimeout(() => {
					console.log(
						`Sending email from: ${this.config.emailUser} to ${send} with the subject ${subject}`
					);
					this.transport.sendMail({
						from: `"Petio" <${this.config.emailUser}>`,
						to: [send, this.adminEmail],
						subject: subject,
						html: this.mailHtml(title, text, img),
						text: text,
						onError: (e) => console.log(e),
						onSuccess: (i) =>
							console.log('Message sent: %s', i.messageId),
					});
				}, timeout); //timeout between emails
			});
		} catch (err) {
			console.log('Email failed');
			console.log(err);
		}
	}
}

module.exports = Mailer;
