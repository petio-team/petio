import React from 'react';
import {
	HashRouter,
	Switch,
	Route,
	Link,
	withRouter,
	useHistory,
} from 'react-router-dom';
import { connect } from 'react-redux';
import Sidebar from './components/Sidebar';
import Login from './components/Login';
import Dashboard from './page/Dashboard';
import { ReactComponent as Spinner } from './assets/svg/spinner.svg';
import Api from './data/Api';
import Setup from './page/Setup';

class App extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			isLoggedIn: false,
			loading: true,
			config: false,
		};

		this.changeLogin = this.changeLogin.bind(this);
		this.checkConfig = this.checkConfig.bind(this);
	}

	checkConfig() {
		Api.checkConfig()
			.then((res) => {
				console.log(res);
				this.setState({
					config: res.config,
					loading: false,
				});
			})
			.catch(() => {
				alert('The Api Service is not running');
			});
	}

	changeLogin(value) {
		this.setState({
			isLoggedIn: value,
		});
	}

	componentDidMount() {
		this.checkConfig();
	}

	render() {
		if (this.state.loading) {
			return (
				<div className="spinner">
					<Spinner />
				</div>
			);
		}
		if (this.state.config === false) {
			return (
				<div className="app">
					<Setup checkConfig={this.checkConfig} />
				</div>
			);
		}
		if (!this.state.isLoggedIn) {
			return (
				<div className="app">
					<Login
						logged_in={this.state.isLoggedIn}
						changeLogin={this.changeLogin}
					/>
				</div>
			);
		} else {
			return (
				<div className="app">
					<HashRouter>
						<Sidebar />
						<div className="view">
							<Switch>
								<Route exact path="/">
									<Dashboard
										user={this.props.user}
										api={this.props.api}
									/>
								</Route>
							</Switch>
						</div>
					</HashRouter>
				</div>
			);
		}
	}
}

function AppContainer(props) {
	return <App plex={props.plex} api={props.api} user={props.user} />;
}

const mapStateToProps = function (state) {
	return {
		plex: state.plex,
		api: state.api,
		user: state.user,
	};
};

export default connect(mapStateToProps)(AppContainer);
