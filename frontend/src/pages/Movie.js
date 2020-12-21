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
			if (requests.users.includes(this.props.user.current.id)) {
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

	timeConvert(n) {
		var num = n;
		var hours = num / 60;
		var rhours = Math.floor(hours);
		var minutes = (hours - rhours) * 60;
		var rminutes = Math.round(minutes);
		var hrs =
			rhours < 1 ? '' : rhours === 1 ? 'hr' : rhours > 1 ? 'hrs' : '';
		return `${rhours >= 1 ? rhours : ''} ${hrs} ${rminutes} mins`;
	}

	findNested(obj, key, value) {
		// Base case
		if (obj[key] === value) {
			return obj;
		} else {
			for (var i = 0, len = Object.keys(obj).length; i < len; i++) {
				if (typeof obj[i] == 'object') {
					var found = this.findNested(obj[i], key, value);
					if (found) {
						// If the object was found in the recursive call, bubble it up.
						return found;
					}
				}
			}
		}
	}

	render() {
		let id = this.state.id;
		let movieData = null;
		if (this.props.api.movie_lookup[id])
			movieData = this.props.api.movie_lookup[id];

		if (!movieData) {
			return <MovieShowLoading />;
		}

		if (movieData.isMinified) {
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

		let requestBtn = movieData.on_server ? (
			<div className="btn btn__square good">
				<CheckIcon />
				On Plex
			</div>
		) : this.state.requested ? (
			<button className="btn btn__square blue" onClick={this.request}>
				{`Requested by ${this.state.requested} 
				${this.state.requested > 1 ? 'users' : 'user'}`}
			</button>
		) : (
			<button className="btn btn__square" onClick={this.request}>
				<RequestIcon />
				Request
			</button>
		);

		let watchBtn = movieData.onServer ? (
			<button className="btn btn__square good">
				<WatchIcon />
				Play
			</button>
		) : null;

		let reportBtn = (
			<button className="btn btn__square" onClick={this.props.openIssues}>
				<ReportIcon />
				Report an issue
			</button>
		);

		let reviewBtn = null;

		if (this.props.user.reviews) {
			if (this.props.user.reviews[this.props.match.params.id]) {
				var hasReviewed = false;
				for (
					var i = 0;
					i <
					this.props.user.reviews[this.props.match.params.id].length;
					i++
				) {
					if (
						this.props.user.reviews[this.props.match.params.id][i]
							.user == this.props.user.current.id
					) {
						hasReviewed = this.props.user.reviews[
							this.props.match.params.id
						][i];
						break;
					}
				}
				reviewBtn = (
					<button
						className="btn btn__square"
						onClick={this.openReview}
					>
						{!hasReviewed ? (
							<>
								<StarIcon />
								Review
							</>
						) : (
							<>
								<StarIcon />
								Reviewed {(hasReviewed.score / 10) * 100}%
							</>
						)}
					</button>
				);
			}
		}

		let criticRating = movieData.vote_average;

		let director = this.findNested(
			movieData.credits.crew,
			'job',
			'Director'
		);

		let screenplay = this.findNested(
			movieData.credits.crew,
			'job',
			'Screenplay'
		);

		let video = movieData.videos.results
			? movieData.videos.results[0]
			: false;

		if (video) {
			if (video.site !== 'YouTube') {
				video = false;
			}
		}

		let userRating = 'Not Reviewed';
		let userRatingVal = 0;

		if (this.props.user.reviews) {
			if (this.props.user.reviews[this.props.match.params.id]) {
				if (
					Object.keys(
						this.props.user.reviews[this.props.match.params.id]
					).length > 0
				) {
					let ratingsUser = 0;

					Object.keys(
						this.props.user.reviews[this.props.match.params.id]
					).map((r) => {
						ratingsUser +=
							(this.props.user.reviews[
								this.props.match.params.id
							][r].score /
								10) *
							100;
					});

					userRating = `${(
						ratingsUser /
						Object.keys(
							this.props.user.reviews[this.props.match.params.id]
						).length
					).toFixed(0)}% (${
						Object.keys(
							this.props.user.reviews[this.props.match.params.id]
						).length
					} reviews)`;
					userRatingVal =
						ratingsUser /
						Object.keys(
							this.props.user.reviews[this.props.match.params.id]
						).length;
				}
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
				<div
					className={`movie-top ${
						this.state.trailer ? 'show-trailer' : ''
					}`}
				>
					<div
						className="movie-backdrop"
						key={`${movieData.title}__backdrop`}
					>
						{video && this.state.trailer ? (
							<div className="series-trailer">
								<iframe
									style={{ pointerEvents: 'none' }}
									frameBorder="0"
									height="100%"
									width="100%"
									src={`https://youtube.com/embed/${video.key}?autoplay=1&controls=0&showinfo=0&autohide=1&loop=1&modestbranding=1&playsinline=1&rel=0`}
								></iframe>
							</div>
						) : null}
						{movieData.backdrop_path ? (
							<LazyLoadImage
								src={
									'https://image.tmdb.org/t/p/w1280/' +
									movieData.backdrop_path
								}
								alt={movieData.title}
								effect="blur"
								key={`${movieData.title}__backdrop`}
							/>
						) : (
							<div
								className="no-backdrop"
								style={{
									backgroundImage: 'url(/p-seamless.png)',
								}}
							></div>
						)}
					</div>
					<div className="movie-poster">
						<div className="movie-poster--inner">
							{movieData.poster_path ? (
								<LazyLoadImage
									src={
										'https://image.tmdb.org/t/p/w500/' +
										movieData.poster_path
									}
									alt={movieData.title}
									effect="blur"
									key={`${movieData.title}__poster`}
								/>
							) : null}
						</div>
					</div>
					<div className="movie-details">
						<span></span>
						<div className="movie-details--top">
							{movieData.logo ? (
								<LazyLoadImage
									className="movie-logo"
									src={movieData.logo}
								/>
							) : (
								<h1 className="single-title">
									{movieData.title}
								</h1>
							)}
						</div>
						<div className="movie--actions">
							{watchBtn}
							{requestBtn}
							{reportBtn}
						</div>
					</div>
				</div>
				<div className="movie-content">
					<section>
						<div className="quick-view">
							<div className="side-content">
								<div className="movie-action">
									{video ? (
										<button
											onClick={this.showTrailer}
											className="btn btn__square"
										>
											<TrailerIcon />
											Trailer
										</button>
									) : null}
									{reviewBtn}
									<div className="resolutions">
										{movieData.available_resolutions.includes(
											'4k'
										) ? (
											<ResIconUHd />
										) : null}
										{movieData.available_resolutions.includes(
											'1080'
										) ? (
											<ResIconFHd />
										) : null}
										{movieData.available_resolutions.includes(
											'720'
										) ? (
											<ResIconHd />
										) : null}
									</div>
								</div>
							</div>
							<div className="info">
								<div className="details">
									<p className="year">
										{new Date(
											movieData.release_date
										).getFullYear()}
									</p>
									<p className="spacer">|</p>
									<p className="runtime">
										{this.timeConvert(movieData.runtime)}
									</p>
									<p className="spacer">|</p>
									<p className="genre">
										{movieData.genres.map((genre, i) => {
											if (
												i ===
												movieData.genres.length - 1
											)
												return genre.name;
											return genre.name + ' / ';
										})}
									</p>
									<p className="spacer hide-mb">|</p>
									<p>
										Rating:{' '}
										<span
											className={`color-${
												criticRating > 7.9
													? 'green'
													: criticRating > 6.9
													? 'blue'
													: criticRating > 4.9
													? 'orange'
													: 'red'
											}`}
										>
											{criticRating}
										</span>
									</p>
									<p className="spacer">|</p>
									<p>
										User Rating:{' '}
										<span
											className={`color-${
												userRatingVal > 79
													? 'green'
													: userRatingVal > 69
													? 'blue'
													: userRatingVal > 49
													? 'orange'
													: 'red'
											}`}
										>
											{userRating}
										</span>
									</p>
								</div>
								<div className="movie-action__mobile">
									{watchBtn}
									{requestBtn}
									{reportBtn}
									{reviewBtn}
								</div>
								<div className="movie-crew">
									{director ? (
										<div className="movie-crew--item">
											<p className="sub-title">
												Director
											</p>
											<Link
												to={`/person/${director.id}`}
												className="crew-credit"
											>
												{director.name}
											</Link>
										</div>
									) : null}
									{screenplay ? (
										<div className="movie-crew--item">
											<p className="sub-title">
												Screenplay
											</p>
											<Link
												to={`/person/${screenplay.id}`}
												className="crew-credit"
											>
												{screenplay.name}
											</Link>
										</div>
									) : null}
								</div>
								<p className="sub-title mb--1">Synopsis</p>
								<p className="overview">{movieData.overview}</p>
							</div>
						</div>
					</section>
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
