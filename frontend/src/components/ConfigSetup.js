import React from 'react';
import { withRouter, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { ReactComponent as ServerIcon } from '../assets/svg/server.svg';
import Api from '../data/Api';

class ConfigSetup extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			display: false,
			selectedServer: false,
			configReady: false,
		};

		this.selectServer = this.selectServer.bind(this);
		this.saveConfig = this.saveConfig.bind(this);
	}

	componentDidMount() {
		setTimeout(() => {
			this.setState({
				display: true,
			});
		}, 500);
	}

	selectServer(e) {
		let server = e.currentTarget.dataset.id;
		this.setState({
			selectedServer: server,
		});
	}

	saveConfig() {
		if (!this.state.selectedServer) return;
		Api.saveConfig(this.state.selectedServer).then(() => {
			this.setState({
				configReady: true,
			});
		});
	}

	render() {
		let configNext = (
			<p>
				Your config file should have auto downloaded, place this config
				file in the root of your Petio install and then refresh the
				page.
			</p>
		);
		let serverSelect = (
			<>
				<p>
					Choose your server from the options below. This will lock
					this install of Petio to a specific server running Api.
					Servers not running Api will be greyed out.
				</p>
				<h3 className="sub-title">Servers</h3>
				<div className="server-list">
					{this.props.api.servers.map((server) => {
						return (
							<div
								className="server-list--item"
								key={server.machineId}
							>
								<div
									className={`server-list--item-inner ${
										!server.url ? 'disabled' : ''
									} ${
										this.state.selectedServer ===
										server.machineId
											? 'active'
											: ''
									}`}
									data-id={server.machineId}
									onClick={this.selectServer}
								>
									<div className="icon">
										<ServerIcon />
									</div>
									{server.name}
								</div>
							</div>
						);
					})}
				</div>
			</>
		);
		return (
			<div
				className={`config-setup ${this.state.display ? 'loaded' : ''}`}
			>
				<div className="config-setup--inner">
					<h1 className="main-title">Config Setup</h1>
					{this.state.configReady ? configNext : serverSelect}

					{this.state.selectedServer && !this.state.configReady ? (
						<button className="btn" onClick={this.saveConfig}>
							Submit
						</button>
					) : null}
				</div>
			</div>
		);
	}
}

function ConfigSetupContainer(props) {
	return <ConfigSetup api={props.api} />;
}

const mapStateToProps = function (state) {
	return {
		api: state.api,
	};
};

export default connect(mapStateToProps)(ConfigSetupContainer);
