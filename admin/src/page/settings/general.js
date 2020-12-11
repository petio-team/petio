import React from 'react';
import Api from '../../data/Api';

import { ReactComponent as Spinner } from '../../assets/svg/spinner.svg';

class General extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			email_user: '',
			email_pass: '',
			email_server: '',
			email_port: '',
			email_secure: false,
			email_pass_set: false,
			email_enabled: false,
		};

		this.inputChange = this.inputChange.bind(this);
		this.closeMsg = false;
		this.saveEmail = this.saveEmail.bind(this);
		this.loadConfigs = this.loadConfigs.bind(this);
	}

	inputChange(e) {
		const target = e.target;
		const name = target.name;
		let value = target.value;

		if (target.type === 'checkbox') {
			value = target.checked;
		}

		this.setState({
			[name]: value,
		});
	}

	async saveEmail() {
		await Api.saveEmailConfig({
			user: this.state.email_user,
			pass: this.state.email_pass,
			server: this.state.email_server,
			port: this.state.email_port,
			secure: this.state.email_secure,
			enabled: this.state.email_enabled,
		});

		this.setState({
			isError: false,
			isMsg: 'Email settings saved!',
		});
		clearInterval(this.closeMsg);
		this.closeMsg = setInterval(() => {
			this.setState({
				isError: false,
				isMsg: false,
			});
		}, 3000);
	}

	async loadConfigs() {
		try {
			let email = await Api.getEmailConfig();
			this.setState({
				email_enabled: email.config.emailEnabled,
				email_user: email.config.emailUser,
				email_server: email.config.emailServer,
				email_port: email.config.emailPort,
				email_secure: email.config.emailSecure,
				loading: false,
				email_pass_set: email.config.emailPass ? true : false,
				isError: false,
				isMsg: 'Email config loaded',
			});
		} catch (err) {
			console.log(err);
			this.setState({
				loading: false,
				isError: 'Error getting email config',
			});
		}
	}

	componentDidMount() {
		this.loadConfigs();
	}

	componentWillUnmount() {
		clearInterval(this.closeMsg);
	}

	render() {
		if (this.state.loading) {
			return (
				<>
					{this.state.isError ? (
						<div className="setting-msg error">
							<p>{this.state.isError}</p>
						</div>
					) : null}
					{this.state.isMsg ? (
						<div className="setting-msg good">
							<p>{this.state.isMsg}</p>
						</div>
					) : null}
					<div className="spinner--settings">
						<Spinner />
					</div>
				</>
			);
		}
		return (
			<>
				{this.state.isError ? (
					<div className="setting-msg error">
						<p>{this.state.isError}</p>
					</div>
				) : null}
				{this.state.isMsg ? (
					<div className="setting-msg good">
						<p>{this.state.isMsg}</p>
					</div>
				) : null}
				<section>
					<p className="main-title">General</p>
				</section>
				<section>
					<p className="main-title mb--2">Plex</p>
					<p>
						If connection has been lost to Plex re-authenticate
						here.
					</p>
					<button className="btn">Login with plex</button>
				</section>
				<section>
					<p className="main-title mb--2">Email</p>
					<label>Username</label>
					<input
						type="text"
						name="email_user"
						value={this.state.email_user}
						onChange={this.inputChange}
						autoComplete="new-password"
						autoCorrect="off"
						spellCheck="off"
					/>
					<label>Password</label>
					<input
						type="password"
						name="email_pass"
						value={this.state.email_pass}
						onChange={this.inputChange}
						placeholder={
							this.state.email_pass_set ? '••••••••••' : ''
						}
						autoComplete="new-password"
						autoCorrect="off"
						spellCheck="off"
					/>
					<label>SMTP Server</label>
					<input
						type="text"
						name="email_server"
						value={this.state.email_server}
						onChange={this.inputChange}
						autoComplete="new-password"
						autoCorrect="off"
						spellCheck="off"
					/>
					<label>Port</label>
					<input
						type="number"
						name="email_port"
						value={this.state.email_port}
						onChange={this.inputChange}
						autoComplete="new-password"
						autoCorrect="off"
						spellCheck="off"
					/>
					<div className="checkbox-wrap mb--2">
						<input
							type="checkbox"
							name="email_enabled"
							checked={this.state.email_enabled}
							onChange={this.inputChange}
						/>
						<p>Enabled</p>
					</div>

					<button
						className="btn"
						style={{ marginRight: '10px' }}
						onClick={this.saveEmail}
					>
						Save
					</button>

					<button className="btn">Test</button>
				</section>
			</>
		);
	}
}

export default General;
