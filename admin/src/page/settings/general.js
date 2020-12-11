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
			</>
		);
	}
}

export default General;
