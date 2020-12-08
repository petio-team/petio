import React from 'react';
import { withRouter, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import PersonCard from '../components/PersonCard';
import TvCard from '../components/TvCard';
import Api from '../data/Api';
import Carousel from '../components/Carousel';
import { ReactComponent as RequestIcon } from '../assets/svg/request.svg';
import { ReactComponent as ReportIcon } from '../assets/svg/report.svg';
import { ReactComponent as WatchIcon } from '../assets/svg/play.svg';
import { ReactComponent as CheckIcon } from '../assets/svg/check.svg';
import { ReactComponent as StarIcon } from '../assets/svg/star.svg';
import { ReactComponent as TrailerIcon } from '../assets/svg/video.svg';
import { ReactComponent as PersonCircleIcon } from '../assets/svg/person-circle.svg';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import User from '../data/User';
import Review from '../components/Review';
import ReviewsList from '../components/ReviewsLists';
import MovieShowLoading from '../components/MovieShowLoading';

class Series extends React.Component {
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

		this.getSeries = this.getSeries.bind(this);
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
			});
			this.init();
		}
	}

	init() {
		let page = document.querySelectorAll('.page-wrap')[0];
		page.scrollTop = 0;
		window.scrollTo(0, 0);
		let id = this.props.match.params.id;

		this.getSeries(id);
		this.getRequests();
		this.getReviews();
	}

	componentDidMount() {
		this.init();
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
		} else if (!requests[id] && this.state.requested) {
			this.setState({
				requested: false,
			});
		}
	}

	request() {
		let id = this.props.match.params.id;
		let series = this.props.api.series_lookup[id];
		let requests = this.props.user.requests[id];
		if (requests) {
			if (requests.users.includes(this.props.user.current._id)) {
				alert('Already Requested');
				return;
			}
		}
		let request = {
			id: series.id,
			tmdb_id: series.id,
			tvdb_id: series.tvdb_id,
			imdb_id: series.imdb_id,
			title: series.name,
			type: 'tv',
			thumb: series.poster_path,
		};
		User.request(request, this.props.user.current).then(() => {
			User.getRequests();
		});
	}

	getReviews() {
		let id = this.props.match.params.id;
		User.getReviews(id);
	}

	getSeries() {
		let id = this.props.match.params.id;

		if (!this.props.api.series_lookup[id]) {
			// check for cached
			Api.series(id);
		} else if (this.props.api.series_lookup[id].isMinified) {
			Api.series(id);
		}
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

	showTrailer() {
		this.setState({
			trailer: this.state.trailer ? false : true,
		});
	}

	render() {
		let id = this.state.id;
		let seriesData = this.props.api.series_lookup[id];

		if (!seriesData) {
			return <MovieShowLoading />;
		}

		if (seriesData.isMinified) {
			return <MovieShowLoading />;
		}

		let related = null;
		let relatedItems = null;
		if (seriesData.recommendations) {
			relatedItems = seriesData.recommendations.map((key) => {
				// if (this.props.api.series_lookup[id]) {
				return (
					<div className="related--item" key={`related-${key}`}>
						<TvCard series={{ id: key }} />
					</div>
				);
				// }
			});
			related = (
				<section>
					<h3 className="sub-title mb--1">Related Shows</h3>
					<Carousel>{relatedItems}</Carousel>
				</section>
			);
		}

		let requestBtn = seriesData.on_server ? (
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

		let watchBtn = this.state.onServer ? (
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
							.user == this.props.user.current._id
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

		let seasons = seriesData.seasons;

		let criticRating = seriesData.vote_average;

		let video = seriesData.videos.results
			? seriesData.videos.results[0]
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
					).length
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
				className="series-wrap"
				data-id={seriesData.imdb_id}
				key={`${seriesData.title}__wrap`}
			>
				<Review
					id={this.props.match.params.id}
					user={this.props.user.current}
					active={this.state.reviewOpen}
					closeReview={this.closeReview}
					getReviews={this.getReviews}
					item={seriesData}
				/>
				<div
					className={`series-top ${
						this.state.trailer ? 'show-trailer' : ''
					}`}
				>
					<div
						className={`series-backdrop`}
						key={`${seriesData.title}__backdrop`}
					>
						{video && this.state.trailer ? (
							<div className="series-trailer">
								<iframe
									frameBorder="0"
									height="100%"
									width="100%"
									src={`https://youtube.com/embed/${video.key}?autoplay=1&controls=0&showinfo=0&autohide=1&loop=1&modestbranding=1&playsinline=1&playlist=${video.key}`}
								></iframe>
							</div>
						) : null}
						{seriesData.backdrop_path ? (
							<LazyLoadImage
								src={
									'https://image.tmdb.org/t/p/w1280/' +
									seriesData.backdrop_path
								}
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
					<div
						className="series-poster"
						key={`${seriesData.title}__poster`}
					>
						<div className="series-poster--inner">
							{seriesData.poster_path ? (
								<LazyLoadImage
									src={
										'https://image.tmdb.org/t/p/w500/' +
										seriesData.poster_path
									}
								/>
							) : null}
						</div>
					</div>
					<div className="series-details">
						<span></span>
						<div className="series-details--top">
							{seriesData.logo ? (
								<LazyLoadImage
									className="series-logo"
									src={seriesData.logo}
								/>
							) : (
								<h1 className="single-title">
									{seriesData.original_name}
								</h1>
							)}
						</div>

						<div className="series--actions">
							{watchBtn}
							{requestBtn}
							{reportBtn}
						</div>
					</div>
				</div>
				<div className="series-content">
					<section>
						<div className="quick-view">
							<div className="side-content">
								<div className="series-action">
									<button
										onClick={this.showTrailer}
										className="btn btn__square"
									>
										<TrailerIcon />
										Trailer
									</button>
									{reviewBtn}
								</div>
							</div>
							<div className="info">
								<div className="details">
									<p className="year">
										{new Date(
											seriesData.first_air_date
										).getFullYear() +
											' - ' +
											new Date(
												seriesData.last_air_date
											).getFullYear()}
									</p>
									<p className="spacer">|</p>
									<p className="network">
										{seriesData.networks[0]
											? seriesData.networks[0].name
											: ''}
									</p>
									<p className="spacer">|</p>
									<p className="genre">
										{seriesData.genres.map((genre, i) => {
											if (
												i ===
												seriesData.genres.length - 1
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
								<div className="series-action__mobile">
									{watchBtn}
									{requestBtn}
									{reportBtn}
									{reviewBtn}
								</div>
								<div className="series-crew">
									{seriesData.created_by[0] ? (
										<div className="series-crew--item">
											<p className="sub-title">
												Created by
											</p>
											<Link
												to={`/person/${seriesData.created_by[0].id}`}
												className="crew-credit"
											>
												{seriesData.created_by[0].name}
											</Link>
										</div>
									) : null}
									{seriesData.created_by[1] ? (
										<div className="series-crew--item">
											<p className="sub-title">
												Created By
											</p>
											<Link
												to={`/person/${seriesData.created_by[1].id}`}
												className="crew-credit"
											>
												{seriesData.created_by[1].name}
											</Link>
										</div>
									) : null}
								</div>
								<p className="sub-title mb--1">Synopsis</p>
								<p className="overview">
									{seriesData.overview}
								</p>
							</div>
						</div>
					</section>

					<section>
						<h3 className="sub-title mb--1">Seasons</h3>
						<Carousel>
							{seasons.map((season) => {
								return (
									<div
										className="card type--movie-tv"
										key={`season--${season.season_number}${id}`}
									>
										<div className="card--inner">
											<Link
												to={`/series/${id}/season/${season.season_number}`}
												className="full-link"
											></Link>
											<div className="image-wrap">
												{season.poster_path ? (
													<img
														src={`https://image.tmdb.org/t/p/w200/${season.poster_path}`}
														alt={season.name}
													/>
												) : seriesData.poster_path ? (
													<img
														src={`https://image.tmdb.org/t/p/w500/${seriesData.poster_path}`}
														alt={season.name}
													/>
												) : null}
											</div>
											<div className="text-wrap">
												<p className="title">
													{season.name}
													<span className="year">
														{season.air_date
															? '(' +
															  new Date(
																	season.air_date
															  ).getFullYear() +
															  ')'
															: ''}
													</span>
												</p>
											</div>
										</div>
									</div>
								);
							})}
						</Carousel>
					</section>
					<section>
						<h3 className="sub-title mb--1">Cast</h3>
						<Carousel>
							{seriesData.credits.cast.map((cast, key) => {
								return (
									<PersonCard
										key={`${cast.name}--${cast.character}`}
										person={cast}
										character={cast.character}
									/>
								);
							})}
						</Carousel>
					</section>
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

Series = withRouter(Series);

function SeriesContainer(props) {
	return (
		<Series
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

export default connect(mapStateToProps)(SeriesContainer);
