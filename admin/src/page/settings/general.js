import React from 'react';
import Api from '../../data/Api';

import { ReactComponent as Spinner } from '../../assets/svg/spinner.svg';

class General extends React.Component {
	constructor(props) {
		super(props);

		this.state = {};

		this.inputChange = this.inputChange.bind(this);
		this.closeMsg = false;
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

	componentWillUnmount() {
		clearInterval(this.closeMsg);
	}

	render() {
		return (
			<>
				<p className="main-title">
					<section>General</section>
				</p>
				<section>
					<p className="main-title mb--2">Plex</p>
					<p>
						If connection has been lost to Plex re-authenticate
						here.
					</p>
					<button className="btn">Login with plex</button>
				</section>
				<section>
					<p>Email Configuration</p>
					<p>
						Please fill out the details for the email address you'd
						like to be used as the send address for any Petio
						emails. The server admin's email address will also
						receive a copy of all emails sent.
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
					<div className="checkbox-wrap">
						<input
							type="checkbox"
							name="secure"
							value={this.state.secure}
							onChange={this.inputChange}
						/>
						<p>Use SSL</p>
					</div>
				</section>
			</>
		);
	}
}

export default General;
