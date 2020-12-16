import React from 'react';
import { ReactComponent as Spinner } from '../assets/svg/spinner.svg';
import User from '../data/User';

class Login extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			loading: false,
			username: '',
			password: '',
		};

		this.loginForm = this.loginForm.bind(this);
		this.inputChange = this.inputChange.bind(this);
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
		let password = this.state.password;
		this.login(username, password);
	}

	login(username, password, cookie = false) {
		this.setState({
			loading: true,
		});
		User.login(username, password, cookie, true)
			.then((res) => {
				this.setState({
					loading: false,
				});
				if (res.error) {
					alert(res.error);
					return;
				}
				if (res.loggedIn) {
					this.props.changeLogin(true);
				}
			})
			.catch((error) => {
				console.log(error);
				// Move this to error message
				alert(
					'There has been an error, Petio may be temporarily unavailable'
				);
				localStorage.removeItem('loggedin');
			});
	}

	loginLocal() {
		if (localStorage.getItem('loggedin')) {
			if (localStorage.getItem('adminloggedin') === 'true') {
				this.login('', false, true, true);
			} else {
				localStorage.removeItem('loggedin');
			}
		}
	}

	componentDidMount() {
		this.loginLocal();
	}

	render() {
		return (
			<div className="login-wrap">
				{!this.state.loading ? (
					<>
						<div className="login--inner">
							<h1 className="logo">
								Pet<span>io</span>
							</h1>
							<p className="main-title">Login</p>
							<p>Log in with your Plex username / password</p>
							<form onSubmit={this.loginForm} autoComplete="on">
								<p>Username</p>
								<input
									type="text"
									name="username"
									value={this.state.username}
									onChange={this.inputChange}
									autoComplete="username"
								/>

								<p>Password</p>
								<input
									type="password"
									name="password"
									value={this.state.password}
									onChange={this.inputChange}
									autoComplete="current-password"
								/>

								<button className="btn">Login</button>
							</form>
						</div>
						<p className="powered-by">
							Petio Admin build (alpha) 0.1.9
						</p>
					</>
				) : (
					<div className="spinner">
						<Spinner />
					</div>
				)}
			</div>
		);
	}
}

export default Login;
