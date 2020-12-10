import React from 'react';
import Api from '../../data/Api';

import { ReactComponent as Spinner } from '../../assets/svg/spinner.svg';

class Radarr extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			radarr_protocol: 'http',
			radarr_host: 'localhost',
			radarr_port: 0,
			radarr_profile: '',
			radarr_path: '',
			radarr_active: false,
			radarr_base: '',
			radarr_apikey: '',
			radarr_paths: false,
			radarr_profiles: false,
			loading: true,
			isError: false,
			isMsg: false,
		};

		this.inputChange = this.inputChange.bind(this);
		this.getRadarr = this.getRadarr.bind(this);
		this.saveChanges = this.saveChanges.bind(this);
		this.test = this.test.bind(this);
	}

	async saveChanges() {
		await Api.saveRadarrConfig({
			enabled: this.state.radarr_active,
			protocol: this.state.radarr_protocol,
			hostname: this.state.radarr_host,
			apiKey: this.state.radarr_apikey,
			port: this.state.radarr_port,
			urlBase: this.state.radarr_base,
			rootPath: this.state.radarr_path,
			profileId: this.state.radarr_profile,
		});
		this.getRadarr();
		this.setState({
			isError: false,
			isMsg: 'Radarr settings saved!',
		});
	}

	async test() {
		await this.saveChanges();
		try {
			let result = await Api.testRadarr();
			if (result.connection) {
				this.setState({
					isError: false,
					isMsg: 'Radarr Test Connection success!',
				});
			} else {
				this.setState({
					isError: 'Radarr Test Connection failed!',
					isMsg: false,
				});
			}
		} catch (err) {
			this.setState({
				isError: 'Radarr Test Connection failed! Error 2',
				isMsg: false,
			});
		}
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

	async getRadarr() {
		try {
			let radarr = await Api.radarrConfig();
			this.setState({
				radarr_protocol: radarr.config.protocol,
				radarr_host: radarr.config.hostname,
				radarr_port: radarr.config.port,
				radarr_profile: radarr.config.profileId,
				radarr_path: radarr.config.rootPath,
				radarr_active: radarr.config.enabled,
				radarr_base: radarr.config.urlBase,
				radarr_apikey: radarr.config.apiKey,
				radarr_paths: radarr.paths,
				radarr_profiles: radarr.profiles,
				loading: false,
			});
		} catch (err) {
			console.log(err);
		}
	}

	componentDidMount() {
		this.getRadarr();
	}

	render() {
		if (this.state.loading) {
			return (
				<div className="spinner--settings">
					<Spinner />
				</div>
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
					<p className="main-title mb--2">Radarr</p>
					<p className="capped-width">
						Radarr is a movie collection manager for Usenet and
						BitTorrent users. It can monitor multiple RSS feeds for
						new movies and will interface with clients and indexers
						to grab, sort, and rename them. It can also be
						configured to automatically upgrade the quality of
						existing files in the library when a better quality
						format becomes available.
					</p>
				</section>
				<section>
					<p className="main-title mb--2">Connection</p>
					{this.state.radarr_host ? (
						<div className="checkbox-wrap mb--2">
							<input
								type="checkbox"
								name="radarr_active"
								checked={this.state.radarr_active}
								onChange={this.inputChange}
							/>
							<p>Enabled</p>
						</div>
					) : null}
					<label>Protocol</label>
					<div className="select-wrap">
						<select
							name="radarr_protocol"
							value={this.state.radarr_protocol}
							onChange={this.inputChange}
						>
							<option value="http">HTTP</option>
							<option value="https">HTTPS</option>
						</select>
					</div>
					<label>Host</label>
					<input
						type="text"
						name="radarr_host"
						value={this.state.radarr_host}
						onChange={this.inputChange}
					/>
					<label>Port</label>
					<input
						type="number"
						name="radarr_port"
						value={this.state.radarr_port}
						onChange={this.inputChange}
					/>
					<label>URL Base</label>
					<input
						type="text"
						name="radarr_base"
						value={this.state.radarr_base}
						onChange={this.inputChange}
					/>
					<label>API Key</label>
					<input
						type="text"
						name="radarr_apikey"
						value={this.state.radarr_apikey}
						onChange={this.inputChange}
					/>
				</section>
				{this.state.radarr_profiles.length > 0 ? (
					<section>
						<p className="main-title mb--2">Configuration</p>
						<p>
							These settings can only be configured once
							connection is established with Radarr
						</p>
						<label>Root Path</label>
						{this.state.radarr_paths ? (
							<div className="select-wrap">
								<select
									name="radarr_path"
									onChange={this.inputChange}
									value={this.state.radarr_path}
								>
									<option key={`srp__na`} value="">
										Please choose
									</option>
									{this.state.radarr_paths.map((item) => {
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
						{this.state.radarr_profiles ? (
							<div className="select-wrap">
								<select
									name="radarr_profile"
									onChange={this.inputChange}
									value={this.state.radarr_profile}
								>
									<option key={`sp__na`} value="">
										Please choose
									</option>
									{this.state.radarr_profiles.map((item) => {
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
					</section>
				) : null}
				<section>
					<button className="btn" onClick={this.saveChanges}>
						Save
					</button>
					<button
						className="btn"
						style={{ marginLeft: '10px' }}
						onClick={this.test}
					>
						Test
					</button>
				</section>
			</>
		);
	}
}

export default Radarr;
