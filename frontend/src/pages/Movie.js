import React from 'react';
import { withRouter, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import PersonCard from '../components/PersonCard';
import MovieCard from '../components/MovieCard';
import Api from '../data/Api';
import Carousel from '../components/Carousel';
import { ReactComponent as RequestIcon } from '../assets/svg/request.svg';
import { ReactComponent as ReportIcon } from '../assets/svg/report.svg';
import { ReactComponent as WatchIcon } from '../assets/svg/play.svg';
import { ReactComponent as CheckIcon } from '../assets/svg/check.svg';
import { ReactComponent as StarIcon } from '../assets/svg/star.svg';
import { ReactComponent as TrailerIcon } from '../assets/svg/video.svg';
import { ReactComponent as ResIconHd } from '../assets/svg/720p.svg';
import { ReactComponent as ResIconFHd } from '../assets/svg/1080p.svg';
import { ReactComponent as ResIconUHd } from '../assets/svg/4k.svg';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import User from '../data/User';
import Review from '../components/Review';
import ReviewsList from '../components/ReviewsLists';
import MovieShowLoading from '../components/MovieShowLoading';
import MovieTop from '../components/movie/MovieTop';
import MovieOverview from '../components/movie/MovieOverview';

class Movie extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			onServer: false,
			id: this.props.match.params.id,
			requested: false,
			related: false,
			trailer: false,
			reviewOpen: false,
		};

		this.getMovie = this.getMovie.bind(this);
		this.request = this.request.bind(this);
		this.getRequests = this.getRequests.bind(this);
		// this.getRelated = this.getRelated.bind(this);
		this.init = this.init.bind(this);
		this.showTrailer = this.showTrailer.bind(this);
		this.openReview = this.openReview.bind(this);
		this.closeReview = this.closeReview.bind(this);
		this.getReviews = this.getReviews.bind(this);
	}

	componentDidUpdate() {
		this.getRequests();
		if (this.props.match.params.id !== this.state.id) {
			this.setState({
				onServer: false,
				id: this.props.match.params.id,
				requested: false,
				related: false,
				trailer: false,
			});
			this.init();
		}
	}

	init() {
		let page = document.querySelectorAll('.page-wrap')[0];
		page.scrollTop = 0;
		window.scrollTo(0, 0);
		let id = this.props.match.params.id;

		this.getMovie(id);
		this.getRequests();
		this.getReviews();
	}

	getRequests() {
		let id = this.props.match.params.id;
		let requests = this.props.user.requests;
		if (!requests) return;
		if (!requests[id]) {
			if (this.state.requested) {
				this.setState({
					requested: false,
				});
			}
			return;
		}
		let requestUsers = Object.keys(requests[id].users).length;
		if (
			this.props.user.requests[id] &&
			requestUsers !== this.state.requested
		) {
			this.setState({
				requested: requestUsers,
			});
		}
	}

	request() {
		let id = this.props.match.params.id;
		let movie = this.props.api.movie_lookup[id];
		let requests = this.props.user.requests[id];
		if (requests) {
			if (requests.users.includes(this.props.user.current._id)) {
				alert('Already Requested');
				return;
			}
		}
		let request = {
			id: movie.id,
			imdb_id: movie.imdb_id,
			tmdb_id: movie.id,
			tvdb_id: 'n/a',
			title: movie.title,
			thumb: movie.poster_path,
			type: 'movie',
		};
		User.request(request, this.props.user.current).then(() => {
			User.getRequests().then(() => {
				this.getRequests();
			});
		});
	}

	openReview() {
		this.setState({
			reviewOpen: true,
		});
	}

	closeReview() {
		this.setState({
			reviewOpen: false,
		});
	}

	componentDidMount() {
		this.init();
	}

	getReviews() {
		console.log('reviews got');
		let id = this.props.match.params.id;
		User.getReviews(id);
	}

	getMovie() {
		let id = this.props.match.params.id;

		// this.getRelated();
		if (!this.props.api.movie_lookup[id]) {
			// check for cached
			Api.movie(id);
		} else if (this.props.api.movie_lookup[id].isMinified) {
			Api.movie(id);
		}
	}

	showTrailer() {
		this.setState({
			trailer: this.state.trailer ? false : true,
		});
	}

	render() {
		let id = this.state.id;
		let movieData = null;
		if (this.props.api.movie_lookup[id])
			movieData = this.props.api.movie_lookup[id];

		if (
			!movieData ||
			movieData.isMinified ||
			!this.props.user ||
			movieData.error
		) {
			return <MovieShowLoading />;
		}

		let related = null;
		let relatedItems = null;
		if (movieData.recommendations) {
			relatedItems = movieData.recommendations.map((key) => {
				// if (this.props.api.movie_lookup[id]) {
				return (
					<div className="related--item" key={`related-${key}`}>
						<MovieCard movie={{ id: key }} />
					</div>
				);
				// }
			});
			related = (
				<section>
					<h3 className="sub-title mb--1">Related Movies</h3>
					<Carousel>{relatedItems}</Carousel>
				</section>
			);
		}

		let video = movieData.videos.results
			? movieData.videos.results[0]
			: false;

		if (video) {
			if (video.site !== 'YouTube') {
				video = false;
			}
		}

		return (
			<div
				className="movie-wrap"
				data-id={movieData.imdb_id}
				key={`${movieData.title}__wrap`}
			>
				<Review
					id={this.props.match.params.id}
					user={this.props.user.current}
					active={this.state.reviewOpen}
					closeReview={this.closeReview}
					getReviews={this.getReviews}
					item={movieData}
				/>
				<MovieTop
					movieData={movieData}
					openIssues={this.props.openIssues}
					trailer={this.state.trailer}
					requested={this.state.requested}
					request={this.request}
				/>
				<div className="movie-content">
					<MovieOverview
						movieData={movieData}
						video={video}
						user={this.props.user}
						showTrailer={this.showTrailer}
						match={this.props.match}
						openReview={this.openReview}
					/>
					<section>
						<h3 className="sub-title mb--1">Cast</h3>
						<Carousel>
							{movieData.credits.cast.map((cast, key) => {
								return (
									<PersonCard
										key={`person--${cast.name}`}
										person={cast}
										character={cast.character}
									/>
								);
							})}
						</Carousel>
					</section>
					{movieData.belongs_to_collection &&
					movieData.collection.length > 0 ? (
						<section>
							<h3 className="sub-title mb--1">
								{movieData.belongs_to_collection.name}
							</h3>
							<Carousel>
								{movieData.collection.map((key) => {
									return (
										<div
											className="collection--item"
											key={`collection-${key}`}
										>
											<MovieCard movie={{ id: key }} />
										</div>
									);
								})}
							</Carousel>
						</section>
					) : null}
					{related}
					<section>
						<h3 className="sub-title mb--1">Reviews</h3>
						{this.props.user.reviews ? (
							<ReviewsList
								reviews={this.props.user.reviews[id]}
							/>
						) : null}
					</section>
				</div>
			</div>
		);
	}
}

Movie = withRouter(Movie);

function MovieContainer(props) {
	return (
		<Movie
			api={props.api}
			user={props.user}
			openIssues={props.openIssues}
		/>
	);
}

const mapStateToProps = function (state) {
	return {
		api: state.api,
		user: state.user,
	};
};

export default connect(mapStateToProps)(MovieContainer);
