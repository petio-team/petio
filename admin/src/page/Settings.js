import React from 'react';
import Api from '../data/Api';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

class Settings extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			parent: 'general',
			child: '',
		};
	}
	render() {
		return (
			<div className="settings--wrap">
				<div className="settings--header"></div>
			</div>
		);
	}
}

function SettingsContainer(props) {
	return (
		<Settings
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

export default connect(mapStateToProps)(SettingsContainer);
