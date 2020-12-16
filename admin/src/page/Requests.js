import React from 'react';
import Api from '../data/Api';
import User from '../data/User';
import { ReactComponent as MovieIcon } from '../assets/svg/movie.svg';
import { ReactComponent as TvIcon } from '../assets/svg/tv.svg';
import { ReactComponent as Spinner } from '../assets/svg/spinner.svg';

class Requests extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			requests: false,
			pending: true,
			users: {},
		};

		this.getRequests = this.getRequests.bind(this);
	}

	componentDidMount() {
		this.getRequests();
	}

	componentDidUpdate() {
		if (!this.state.requests) {
			this.getRequests();
		}
	}

	getRequests() {
		let requests = this.props.user.requests;
		if (!requests) {
			User.getRequests();
		} else {
			this.setState({
				requests: requests,
				pending: true,
			});

			Object.keys(requests).map((key) => {
				let req = requests[key];
				for (let i = 0; i < req.users.length; i++) {
					Api.getUser(req.users[i]);
				}
			});

			// Object.keys(requests).map((key) => {
			// 	let request = requests[key];
			// 	// if (request.type === 'movie') {
			// 	// 	Api.movie(key);
			// 	// } else {
			// 	// 	Api.series(key);
			// 	// }
			// });

			this.setState({
				pending: false,
			});
		}
	}

	getUsername(id) {
		if (!this.props.api.users) {
			return null;
		} else if (id in this.props.api.users) {
			return this.props.api.users[id].title;
		} else {
			return null;
		}
	}

	typeIcon(type) {
		let icon = null;
		switch (type) {
			case 'movie':
				icon = <MovieIcon />;
				break;
			case 'tv':
				icon = <TvIcon />;
				break;
			default:
				icon = null;
		}

		return <span className="requests--icon">{icon}</span>;
	}

	render() {
		console.log(this.props.api.users);
		return (
			<div className="requests--wrap">
				{this.state.pending ? (
					<div className="spinner--requests">
						<Spinner />
					</div>
				) : (
					<>
						<section>
							<p className="main-title">Requests</p>
						</section>
						<section>
							<table className="generic-table generic-table__rounded">
								<thead>
									<tr>
										<th>Title</th>
										<th>Type</th>
										<th>Status</th>
										<th>Users</th>
										<th>Quality</th>
										<th>Actions</th>
									</tr>
								</thead>
								<tbody>
									{this.state.requests.length === 0 ? (
										<tr>
											<td>No requests</td>
										</tr>
									) : (
										Object.keys(this.state.requests).map(
											(key) => {
												let req = this.state.requests[
													key
												];
												return (
													<tr key={key}>
														<td>{req.title}</td>
														<td>
															{this.typeIcon(
																req.type
															)}
														</td>
														<td>
															{req.status ? (
																req.status
															) : (
																<span className="requests--status requests--status__manual">
																	Manual
																</span>
															)}
															{req.sonarrId ? (
																<span className="requests--status requests--status__sonarr">
																	Sonarr
																</span>
															) : null}
															{req.radarrId ? (
																<span className="requests--status requests--status__radarr">
																	Radarr
																</span>
															) : null}
														</td>
														<td>
															{req.users.map(
																(user, i) => {
																	return (
																		<p
																			key={`${req.id}_${user}_${i}`}
																		>
																			{this.getUsername(
																				user
																			)}
																		</p>
																	);
																}
															)}
														</td>
														<td></td>
														<td></td>
													</tr>
												);
											}
										)
									)}
								</tbody>
							</table>
						</section>
					</>
				)}
			</div>
		);
	}
}

export default Requests;
