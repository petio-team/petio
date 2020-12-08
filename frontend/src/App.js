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
import Plex from './data/Plex';
import User from './data/User';
import Api from './data/Api';
import Sidebar from './components/Sidebar';
import ConfigSetup from './components/ConfigSetup';
import Search from './pages/Search';
import Series from './pages/Series';
import Season from './pages/Season';
import Movie from './pages/Movie';
import Actor from './pages/Actor';
import Issues from './components/Issues';
import Profile from './pages/Profile';
import Movies from './pages/Movies';
import Requests from './pages/Requests';
import Shows from './pages/Shows';
import { ReactComponent as Spinner } from './assets/svg/spinner.svg';

class App extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			mb_login: false,
			activeServerCheck: false,
			issuesOpen: false,
			isLoggedIn: this.props.user.logged_in,
			loading: false,
		};

		this.openIssues = this.openIssues.bind(this);
		this.closeIssues = this.closeIssues.bind(this);
		this.loginForm = this.loginForm.bind(this);
		this.inputChange = this.inputChange.bind(this);
		this.logout = this.logout.bind(this);
	}

	inputChange(e) {
		const target = e.target;
		const name = target.name;
		let value = target.value;

		this.setState({
			[name]: value,
		});
	}

	loginForm(e) {
		e.preventDefault();
		let username = this.state.username;

		this.login(username);
	}

	login(username, cookie = false) {
		if (!this.props.user.credentials) {
			return;
		}
		this.setState({
			loading: true,
		});
		User.login(username, cookie)
			.then((res) => {
				this.setState({
					loading: false,
				});
				if (res.error) {
					alert(res.error);
					return;
				}
				if (res.loggedIn) {
					this.setState({
						isLoggedIn: true,
					});
				}
				if (res.admin) {
					this.setState({
						isAdmin: true,
					});
				}
				User.getRequests();
			})
			.catch((error) => {
				console.log(error);
				alert(
					'There has been an error, Petio may be temporarily unavailable'
				);
				localStorage.removeItem('loggedin');
			});
	}

	logout() {
		localStorage.removeItem('loggedin');
		localStorage.removeItem('adminloggedin');
		User.logout();
		this.setState({
			isLoggedIn: false,
			isAdmin: false,
		});
	}

	loginLocal() {
		if (localStorage.getItem('loggedin')) {
			if (this.props.user.credentials) {
				this.login('', true);
			} else {
				setTimeout(() => {
					this.loginLocal();
				}, 500);
			}
		}
	}

	openIssues() {
		this.setState({
			openIssues: true,
		});
	}

	closeIssues() {
		this.setState({
			openIssues: false,
		});
	}

	componentDidMount() {
		// if (this.props.user.credentials) {

		// }
		this.loginLocal();
		if (this.state.openIssues) {
			this.setState({
				openIssues: false,
			});
		}
	}

	render() {
		let user = this.props.api.current_user;
		if (!this.state.isLoggedIn) {
			return (
				<div className="login-wrap">
					{!this.state.loading || !this.props.user.credentials ? (
						<>
							<div className="login--inner">
								<h1 className="logo">
									Pet<span>io</span>
								</h1>
								<p className="main-title">
									{!this.state.adminLogin
										? 'Login'
										: 'Admin Login'}
								</p>
								<p>Log in with your Plex username</p>
								<form
									onSubmit={this.loginForm}
									autoComplete="on"
								>
									<p>Username</p>
									<input
										type="text"
										name="username"
										value={this.state.username}
										onChange={this.inputChange}
										autoComplete="username"
									/>
									{this.state.adminLogin ? (
										<>
											<p>Password</p>
											<input
												type="password"
												name="password"
												value={this.state.password}
												onChange={this.inputChange}
												autoComplete="current-password"
											/>
										</>
									) : null}
									<button className="btn">Login</button>
								</form>
							</div>
							<p className="powered-by">
								Petio build (alpha) 0.1.8
							</p>
						</>
					) : (
						<div className="spinner">
							<Spinner />
						</div>
					)}
				</div>
			);
		} else {
			return (
				<div className="page">
					<HashRouter>
						<div className="sidebar">
							<Sidebar />
						</div>

						<Switch>
							<Route exact path="/">
								<div className="page-wrap">
									<Search />
								</div>
							</Route>
							<Route exact path="/user">
								<div className="page-wrap">
									<Profile logout={this.logout} />
								</div>
							</Route>
							<Route exact path="/movie/:id">
								<Issues
									open={this.state.openIssues}
									close={this.closeIssues}
								/>
								<div className="page-wrap">
									<Movie openIssues={this.openIssues} />
								</div>
							</Route>
							<Route exact path="/series/:id">
								<Issues
									open={this.state.openIssues}
									close={this.closeIssues}
								/>
								<div className="page-wrap">
									<Series openIssues={this.openIssues} />
								</div>
							</Route>
							<Route exact path="/series/:id/season/:season">
								<Issues
									open={this.state.openIssues}
									close={this.closeIssues}
								/>
								<Season openIssues={this.openIssues} />
							</Route>
							<Route path="/person/:id">
								<Actor />
							</Route>
							<Route exact path="/requests">
								<div className="page-wrap">
									<Requests />
								</div>
							</Route>
							{/* discovery pages */}
							<Route exact path="/movies">
								<div className="page-wrap">
									<Movies />
								</div>
							</Route>
							<Route exact path="/tv">
								<div className="page-wrap">
									<Shows />
								</div>
							</Route>
						</Switch>
					</HashRouter>
					{!this.props.api.config ? <ConfigSetup /> : null}
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
