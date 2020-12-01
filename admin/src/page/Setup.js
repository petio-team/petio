import React from 'react';
import Plex from '../data/Plex';
import { connect } from 'react-redux';
import { ReactComponent as Spinner } from '../assets/svg/spinner.svg';
import Api from '../data/Api';

/* eslint-disable */
const popupCenter = (url, title, w, h) => {
	// Fixes dual-screen position                             Most browsers      Firefox
	var dualScreenLeft =
		window.screenLeft != undefined ? window.screenLeft : window.screenX;
	var dualScreenTop =
		window.screenTop != undefined ? window.screenTop : window.screenY;

	var width = window.innerWidth
		? window.innerWidth
		: document.documentElement.clientWidth
		? document.documentElement.clientWidth
		: screen.width;
	var height = window.innerHeight
		? window.innerHeight
		: document.documentElement.clientHeight
		? document.documentElement.clientHeight
		: screen.height;

	var left = width / 2 - w / 2 + dualScreenLeft;
	var top = height / 2 - h / 2 + dualScreenTop;
	var newWindow = window.open(
		url,
		title,
		'scrollbars=yes, width=' +
			w +
			', height=' +
			h +
			', top=' +
			top +
			', left=' +
			left
	);

	console.log(
		'scrollbars=yes, width=' +
			w +
			', height=' +
			h +
			', top=' +
			top +
			', left=' +
			left
	);

	if (window.focus) newWindow.focus();
	return newWindow;
};
/* eslint-enable */

class Setup extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			step: 1,
			db: 'mongodb://mongo:27017',
			tls: false,
		};

		this.inputChange = this.inputChange.bind(this);
		this.saveUser = this.saveUser.bind(this);
		this.selectServer = this.selectServer.bind(this);
		this.changeToDb = this.changeToDb.bind(this);
		this.finalise = this.finalise.bind(this);
		this.next = this.next.bind(this);
	}

	inputChange(e) {
		const target = e.target;
		const name = target.name;
		let value = target.value;

		this.setState({
			[name]: value,
		});
	}

	componentDidUpdate() {
		if (this.props.plex.user && this.state.step === 1) {
			this.setState({
				step: 2,
			});
		}
		if (this.state.user && this.state.step === 2) {
			this.setState({
				step: 3,
			});
		}
	}

	loginOauth(e) {
		let plexWindow = popupCenter('', 'Login with Plex', 500, 500);
		Plex.plexAuth(plexWindow);
	}

	saveUser() {
		let password = this.state.password;
		let username = this.props.plex.user.username;
		let id = this.props.plex.user.username;
		let email = this.props.plex.user.email;
		let token = this.props.plex.token;

		this.setState({
			user: {
				username: username,
				id: id,
				email: email,
				password: password,
				token: token,
			},
			password: false,
		});
	}

	selectServer(e) {
		const target = e.target;
		console.log(target);
		let id = target.dataset.id;
		this.setState({
			selectedServer: id,
		});
	}

	changeToDb() {
		this.setState({
			step: 4,
		});
	}

	next() {
		this.setState({
			step: this.state.step + 1,
		});
	}

	finalise() {
		this.setState({
			step: 6,
		});
		let selectedServer = this.props.plex.servers[this.state.selectedServer];
		let config = {
			user: this.state.user,
			server: selectedServer,
			db: this.state.db,
			email: {
				emailUser: this.state.petioEmail,
				emailPass: this.state.petioEmailPass,
				emailServer: this.state.petioSMTP,
				emailPort: this.state.petioPort,
				tls: this.state.tls,
			},
		};
		Api.saveConfig(config)
			.then(() => {
				setTimeout(() => {
					this.props.checkConfig();
				}, 30000);
			})
			.catch((err) => {
				alert(
					'Setup failed, check API is running and no errors, if this persists please contact the dev team.'
				);
			});
	}

	render() {
		return (
			<div className="setup--wrap">
				<p className="main-title">Setup</p>
				{this.state.step === 1 ? (
					<div className="step-1">
						<p>
							Welcome to Petio, firstly lets log in to Plex to get
							all of your user and server info
						</p>
						<button className="btn" onClick={this.loginOauth}>
							Login with plex
						</button>
					</div>
				) : null}
				{this.state.step === 2 ? (
					<div className="step-2">
						<p>
							This is your Petio admin user details, we will use
							your Plex Username / Email, but a custom password
							just for Petio can be used.
						</p>
						<p>Petio Admin Username</p>
						<input
							type="text"
							name="username"
							value={this.props.plex.user.username}
							readOnly={true}
						/>
						<p>Petio Admin Email</p>
						<input
							type="email"
							name="email"
							value={this.props.plex.user.email}
							readOnly={true}
						/>
						<p>Petio Admin Password</p>
						<input
							type="password"
							name="password"
							value={this.state.password}
							onChange={this.inputChange}
						/>
						<button className="btn" onClick={this.saveUser}>
							Next
						</button>
					</div>
				) : null}
				{this.state.step === 3 ? (
					<div className="step-3">
						<p>Please select your server</p>
						{Object.keys(this.props.plex.servers).length === 0 ? (
							<p>
								You don't own any servers. Only the server owner
								can setup a Petio instance.
							</p>
						) : (
							Object.keys(this.props.plex.servers).map((key) => {
								let server = this.props.plex.servers[key];
								return (
									<div
										key={key}
										className={
											'server-select-option ' +
											(this.state.selectedServer === key
												? 'selected'
												: '')
										}
										data-id={key}
										onClick={this.selectServer}
									>
										<p>{server.name}</p>
									</div>
								);
							})
						)}
						<button
							className={
								'btn ' +
								(this.state.selectedServer ? '' : 'disabled')
							}
							style={{ marginTop: '10px' }}
							onClick={this.changeToDb}
						>
							Next
						</button>
					</div>
				) : null}
				{this.state.step === 4 ? (
					<div className="step-4">
						<p>
							Mongo Database path, leave this as default unless
							you have configured your databse differently to
							recommended.
						</p>
						<input
							type="text"
							name="db"
							value={this.state.db}
							onChange={this.inputChange}
						/>
						<button
							className="btn"
							style={{ marginTop: '10px' }}
							onClick={this.next}
						>
							Next
						</button>
					</div>
				) : null}
				{this.state.step === 5 ? (
					<div className="step-5">
						<p>Email Configuration</p>
						<p>
							Please fill out the details for the email address
							you'd like to be used as the send address for any
							Petio emails. The server admin's email address will
							be receive a copy of all emails sent.
						</p>
						<input
							type="email"
							name="petioEmail"
							placeholder="Email Address"
							value={this.state.petioEmail}
							onChange={this.inputChange}
						/>
						<input
							type="password"
							name="petioEmailPass"
							placeholder="Email Password"
							value={this.state.petioEmailPass}
							onChange={this.inputChange}
						/>
						<input
							type="text"
							name="petioSMTP"
							placeholder="SMTP Server / Host Name"
							value={this.state.petioSMTP}
							onChange={this.inputChange}
						/>
						<input
							type="number"
							name="petioPort"
							placeholder="Port Number"
							value={this.state.petioPort}
							onChange={this.inputChange}
						/>
						{/* <div className="checkbox-wrap">
							<input
								type="checkbox"
								name="tls"
								value={this.state.tls}
								onChange={this.inputChange}
							/>
							<p>Use TLS</p>
						</div> */}
						<button
							className="btn"
							style={{ marginTop: '10px' }}
							onClick={this.finalise}
						>
							Finish
						</button>
					</div>
				) : null}
				{this.state.step === 6 ? (
					<div className="step-6">
						<p>Getting things set up...</p>
						<div className="loading">
							<Spinner />
						</div>
					</div>
				) : null}
			</div>
		);
	}
}

function SetupContainer(props) {
	return (
		<Setup
			plex={props.plex}
			api={props.api}
			user={props.user}
			checkConfig={props.checkConfig}
		/>
	);
}

const mapStateToProps = function (state) {
	return {
		plex: state.plex,
		api: state.api,
		user: state.user,
	};
};

export default connect(mapStateToProps)(SetupContainer);
