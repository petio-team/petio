// Config
const user_config = require('../util/config');
if (!user_config) {
	return;
}
const prefs = JSON.parse(user_config);

const emailUser = prefs.emailUser;
const emailPass = prefs.emailPass;
const adminEmail = prefs.adminEmail;
const nodeoutlook = require('nodejs-nodemailer-outlook');

function mail(subject, title, text, img, to = []) {
	let admin = adminEmail;

	if (!adminEmail || !emailPass || !emailUser) {
		console.log('Email not configured, skipping sending emails');
		return;
	}

	to.forEach((send, i) => {
		let timeout = i * 2000;
		i++;
		setTimeout(() => {
			console.log(
				`Sending email from: ${emailUser} to ${send} with the subject ${subject}`
			);
			nodeoutlook.sendEmail({
				auth: {
					user: emailUser,
					pass: emailPass,
				},
				from: emailUser,
				to: [send, admin],
				subject: subject,
				html: mailHtml(title, text, img),
				text: text,
				onError: (e) => console.log(e),
				onSuccess: (i) => console.log(i),
			});
		}, timeout); //timeout between emails
	});
}

let mailHtml = (title, text, img) => {
	return `
		<style>
			@font-face {
				font-family: 'Open Sans';
				font-style: normal;
				font-weight: 300;
				font-display: swap;
				src: local('Open Sans Light'), local('OpenSans-Light'),
					url(https://fonts.gstatic.com/s/opensans/v17/mem5YaGs126MiZpBA-UN_r8OUuhpKKSTjw.woff2)
						format('woff2');
				unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC,
					U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122,
					U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
			}
			@font-face {
				font-family: 'Open Sans';
				font-style: normal;
				font-weight: 400;
				font-display: swap;
				src: local('Open Sans Regular'), local('OpenSans-Regular'),
					url(https://fonts.gstatic.com/s/opensans/v17/mem8YaGs126MiZpBA-UFVZ0bf8pkAg.woff2)
						format('woff2');
				unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC,
					U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122,
					U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
			}
			@font-face {
				font-family: 'Logo';
				src: url('https://beta.request.ashdyson.co.uk/fonts/Khula-Bold.eot');
				src: url('https://beta.request.ashdyson.co.uk/fonts/Khula-Bold.eot?#iefix')
						format('embedded-opentype'),
					url('https://beta.request.ashdyson.co.uk/fonts/Khula-Bold.woff2')
						format('woff2'),
					url('https://beta.request.ashdyson.co.uk/fonts/Khula-Bold.woff')
						format('woff'),
					url('https://beta.request.ashdyson.co.uk/fonts/Khula-Bold.ttf')
						format('truetype');
				font-weight: bold;
				font-style: normal;
				font-display: swap;
			}
			:root {
				color-scheme: light;
			}
		</style>
		<table border="0" cellpadding="0" cellspacing="0" width="100%">
			<tr>
				<td>
					<table class="main-container"
						align="center"
						border="1"
						cellpadding="0"
						cellspacing="0"
						width="300"
						style="
							border-collapse: collapse;
							border: solid 1px #3f4245;
							background: linear-gradient(
								135deg,
								#333b3a,
								#374141 25%,
								#40362b 75%,
								#211a17
							);
							background-size: cover;
							background-repeat: no-repeat;
							box-shadow: 0px -13px 20px 7px #0000007a;
						"
					>
						<tr>
							<td
								style="
									background: #3f4245;
									color: white;
									padding: 10px;
								"
							>
								<p
									style="
										text-transform: uppercase;
										font-size: 32px;
										line-height: 1;
										color: #fff;
										font-family: 'Logo', sans-serif;
										margin: 0;
									"
								>
									Pet<span style="color: #e5a00d;">io</span>
								</p>
							</td>
						</tr>
						<tr>
							<td style="padding: 20px;">
								<h1
									style="
										font-size: 24px;
										line-height: 30px;
										font-weight: 700;
										margin-bottom: 0;
										margin-top: 0;
										color: #fff;
									"
								>
									${title}
								</h1>
								<p
									style="
										color: #fff;
										font-size: 12px;
										line-height: 18px;
										margin-bottom: 25px;
										font-weight: 500;
									"
								>
									${text}
								</p>
								${
									img
										? `<img
									style="
										width: 300px;
										margin: 0 auto;
										display: block;
										max-width: 100%;
									"
									src="${img}"
								/>`
										: ''
								}
							</td>
						</tr>
					</table>
				</td>
			</tr>
		</table>
	`;
};

module.exports = mail;
