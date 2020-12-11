import React from 'react';
import Api from '../../data/Api';

import { ReactComponent as Spinner } from '../../assets/svg/spinner.svg';

class Sonarr extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			sonarr_protocol: 'http',
			sonarr_host: 'localhost',
			sonarr_port: 0,
			sonarr_profile: '',
			sonarr_path: '',
			sonarr_active: false,
			sonarr_base: '',
			sonarr_apikey: '',
			sonarr_paths: false,
			sonarr_profiles: false,
			loading: true,
			isError: false,
			isMsg: false,
		};

		this.inputChange = this.inputChange.bind(this);
		this.getSonarr = this.getSonarr.bind(this);
		this.saveChanges = this.saveChanges.bind(this);
		this.test = this.test.bind(this);

		this.closeMsg = false;
	}

	async saveChanges() {
		await Api.saveSonarrConfig({
			enabled: this.state.sonarr_active,
			protocol: this.state.sonarr_protocol,
			hostname: this.state.sonarr_host,
			apiKey: this.state.sonarr_apikey,
			port: this.state.sonarr_port,
			urlBase: this.state.sonarr_base,
			rootPath: this.state.sonarr_path,
			profileId: this.state.sonarr_profile,
		});
		this.getSonarr();

		this.setState({
			isError: false,
			isMsg: 'Sonarr settings saved!',
		});

		clearInterval(this.closeMsg);
		this.closeMsg = setInterval(() => {
			this.setState({
				isError: false,
				isMsg: false,
			});
		}, 3000);
	}

	async test() {
		await this.saveChanges();
		try {
			let result = await Api.testSonarr();
			if (result.connection) {
				this.setState({
					isError: false,
					isMsg: 'Sonarr Test Connection success!',
				});
			} else {
				this.setState({
					isError: 'Sonarr Test Connection failed!',
					isMsg: false,
				});
			}
		} catch (err) {
			this.setState({
				isError: 'Sonarr Test Connection failed! Error 2',
				isMsg: false,
			});
		}
		clearInterval(this.closeMsg);
		this.closeMsg = setInterval(() => {
			this.setState({
				isError: false,
				isMsg: false,
			});
		}, 3000);
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

	async getSonarr() {
		this.setState({
			loading: true,
		});
		try {
			let sonarr = await Api.sonarrConfig();
			this.setState({
				sonarr_protocol: sonarr.config.protocol,
				sonarr_host: sonarr.config.hostname,
				sonarr_port: sonarr.config.port,
				sonarr_profile: sonarr.config.profileId,
				sonarr_path: sonarr.config.rootPath,
				sonarr_active: sonarr.config.enabled,
				sonarr_base: sonarr.config.urlBase,
				sonarr_apikey: sonarr.config.apiKey,
				sonarr_paths: sonarr.paths,
				sonarr_profiles: sonarr.profiles,
				loading: false,
			});
		} catch (err) {
			console.log(err);
			this.setState({
				loading: false,
			});
		}
	}

	componentDidMount() {
		this.getSonarr();
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
					<p className="main-title mb--2">Sonarr</p>
					<p className="capped-width">
						Sonarr is a PVR for Usenet and BitTorrent users. It can
						monitor multiple RSS feeds for new episodes of your
						favorite shows and will grab, sort and rename them. It
						can also be configured to automatically upgrade the
						quality of files already downloaded when a better
						quality format becomes available.
					</p>
				</section>
				<section>
					<p className="main-title mb--2">Connection</p>
					<label>Protocol</label>
					<div className="select-wrap">
						<select
							name="sonarr_protocol"
							value={this.state.sonarr_protocol}
							onChange={this.inputChange}
						>
							<option value="http">HTTP</option>
							<option value="https">HTTPS</option>
						</select>
					</div>
					<label>Host</label>
					<input
						type="text"
						name="sonarr_host"
						value={this.state.sonarr_host}
						onChange={this.inputChange}
					/>
					<label>Port</label>
					<input
						type="number"
						name="sonarr_port"
						value={this.state.sonarr_port}
						onChange={this.inputChange}
					/>
					<label>URL Base</label>
					<input
						type="text"
						name="sonarr_base"
						value={this.state.sonarr_base}
						onChange={this.inputChange}
					/>
					<label>API Key</label>
					<input
						type="text"
						name="sonarr_apikey"
						value={this.state.sonarr_apikey}
						onChange={this.inputChange}
					/>
				</section>
				{this.state.sonarr_profiles.length > 0 ? (
					<section>
						<p className="main-title mb--2">Configuration</p>
						<p>
							These settings can only be configured once
							connection is established with Sonarr
						</p>
						<label>Root Path</label>
						{this.state.sonarr_paths ? (
							<div className="select-wrap">
								<select
									name="sonarr_path"
									onChange={this.inputChange}
									value={this.state.sonarr_path}
								>
									<option key={`srp__na`} value="">
										Please choose
									</option>
									{this.state.sonarr_paths.map((item) => {
										return (
											<option
												key={`srp__${item.id}`}
												value={item.path}
											>
												{item.path}
											</option>
										);
									})}
								</select>
							</div>
						) : (
							<p>Loading...</p>
						)}
						<label>Profile to use</label>
						{this.state.sonarr_profiles ? (
							<div className="select-wrap">
								<select
									name="sonarr_profile"
									onChange={this.inputChange}
									value={this.state.sonarr_profile}
								>
									<option key={`sp__na`} value="">
										Please choose
									</option>
									{this.state.sonarr_profiles.map((item) => {
										return (
											<option
												key={`sp__${item.id}`}
												value={item.id}
											>
												{item.name}
											</option>
										);
									})}
								</select>
							</div>
						) : (
							<p>Loading...</p>
						)}
						{this.state.sonarr_host &&
						this.state.sonarr_path &&
						this.state.sonarr_profile ? (
							<div className="checkbox-wrap mb--2">
								<input
									type="checkbox"
									name="sonarr_active"
									checked={this.state.sonarr_active}
									onChange={this.inputChange}
								/>
								<p>Enabled</p>
							</div>
						) : null}
					</section>
				) : null}
				<section>
					{this.state.sonarr_host &&
					this.state.sonarr_path &&
					this.state.sonarr_profile ? (
						<button
							className="btn"
							onClick={this.saveChanges}
							style={{ marginRight: '10px' }}
						>
							Save
						</button>
					) : null}
					<button className="btn" onClick={this.test}>
						Test
					</button>
				</section>
			</>
		);
	}
}

export default Sonarr;
