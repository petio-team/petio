import React from 'react';
import { withRouter, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import Mediabutler from '../data/Mediabutler';
import RequestCard from '../components/RequestCard';
import Carousel from '../components/Carousel';

class Requests extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			requests: false,
			loaded: false,
		};

		this.getRequests = this.getRequests.bind(this);
	}

	componentDidMount() {
		let page = document.querySelectorAll('.page-wrap')[0];
		page.scrollTop = 0;
		window.scrollTo(0, 0);
		this.getRequests();
	}

	componentDidUpdate() {
		let requests = this.state.requests;
		if (!requests) {
			this.getRequests();
		}
	}

	getRequests() {
		let requests = this.props.user.requests;
		if (!requests) return;
		this.setState({
			requests: true,
			loaded: true,
		});

		Object.keys(requests).map((key) => {
			let request = requests[key];
			if (request.type === 'movie') {
				Mediabutler.movie(key);
			} else {
				Mediabutler.series(key);
			}
		});
	}

	render() {
		if (!this.state.loaded) {
			return (
				<div className="requests-page">
					<h1 className="main-title">Requests</h1>
					<div className="request-section">
						<p className="sub-title">Loading...</p>
					</div>
				</div>
			);
		}
		let requests = this.props.user.requests;
		let pending = Object.keys(requests).map((key) => {
			let request = this.props.mediabutler.movie_lookup[key];
			if (requests[key].type === 'tv') {
				request = this.props.mediabutler.series_lookup[key];
			}
			if (!request) return null;
			return <RequestCard key={key} request={request} />;
		});
		requests = this.props.user.requests;
		console.log(requests);
		let yourRequests = Object.keys(requests).map((key) => {
			let request = this.props.mediabutler.movie_lookup[key];
			if (requests[key].type === 'tv') {
				request = this.props.mediabutler.series_lookup[key];
			}
			let user = this.props.user.current._id;

			if (!request || !requests[key].users.includes(user)) return null;
			return <RequestCard key={key + '_your'} request={request} />;
		});
		return (
			<div className="requests-page">
				<h1 className="main-title mb--1">Requests</h1>
				<div className="request-section">
					<section>
						<h3 className="sub-title mb--1">Pending Requests</h3>
						<Carousel>{pending}</Carousel>
					</section>
				</div>
				<div className="request-section">
					<section>
						<h3 className="sub-title mb--1">Your Requests</h3>
						<Carousel>{yourRequests}</Carousel>
					</section>
				</div>
			</div>
		);
	}
}

Requests = withRouter(Requests);

function RequestsContainer(props) {
	return <Requests mediabutler={props.mediabutler} user={props.user} />;
}

const mapStateToProps = function (state) {
	return {
		mediabutler: state.mediabutler,
		user: state.user,
	};
};

export default connect(mapStateToProps)(RequestsContainer);
