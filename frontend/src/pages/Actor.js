import React from 'react';
import { withRouter, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import Mediabutler from '../data/Mediabutler';
import MovieCard from '../components/MovieCard';
import TvCard from '../components/TvCard';
import Carousel from '../components/Carousel';
import { ReactComponent as Spinner } from '../assets/svg/spinner.svg';

class Actor extends React.Component {
	constructor(props) {
		super(props);

		this.getActor = this.getActor.bind(this);
		this.handleScroll = this.handleScroll.bind(this);
	}
	componentDidMount() {
		let page = document.querySelectorAll('.page-wrap')[0];
		page.scrollTop = 0;
		window.scrollTo(0, 0);
		let id = this.props.match.params.id;

		this.getActor(id);
	}

	getActor(id) {
		if (!this.props.mediabutler.person_lookup[id]) {
			// check for cached
			Mediabutler.person(id);
		}
	}

	handleScroll(e) {
		let banner = e.currentTarget.querySelectorAll('.person--banner')[0];
		let poster = e.currentTarget.querySelectorAll(
			'.person--thumb--inner'
		)[0];
		let offset =
			e.currentTarget.scrollTop > banner.offsetHeight
				? 1
				: e.currentTarget.scrollTop / banner.offsetHeight;
		let posterOffset = 50 * offset;
		offset = offset * 10 + 40;
		banner.style.backgroundPosition = `50% ${offset}%`;
		poster.style.transform = `translateY(${posterOffset}px)`;
	}

	render() {
		let id = this.props.match.params.id;
		let personData = this.props.mediabutler.person_lookup[id];

		if (!personData) {
			return (
				<div className="page-wrap">
					<div className="spinner">
						<Spinner />
					</div>
				</div>
			);
		}

		let banner = false;
		let bWidth = 0;

		// Credits Movie
		let movieCredits = this.props.mediabutler.actor_movie[id];
		let movieActing = false;
		let movieProduction = false;

		if (movieCredits) {
			movieActing = movieCredits.cast;
			movieProduction = movieCredits.crew;
		}

		// Credits TV
		let tvCredits = this.props.mediabutler.actor_series[id];
		let tvActing = false;
		let tvProduction = false;

		if (tvCredits) {
			tvActing = tvCredits.cast;
			tvProduction = tvCredits.crew;
		}

		if (!personData.images) {
			banner = false;
			bWidth = 0;
		} else {
			personData.images.profiles.forEach((image) => {
				if (image.width > bWidth) {
					banner = image;
					bWidth = image.width;
				}
			});
		}

		return (
			<>
				<div className="page-wrap" onScroll={this.handleScroll}>
					<div
						className="person--banner"
						style={{
							backgroundImage: `url(https://image.tmdb.org/t/p/original/${banner.file_path})`,
						}}
					></div>
					<div className="person--top">
						<div className="person--thumb">
							<div className="person--thumb--inner">
								<img
									src={`https://image.tmdb.org/t/p/w1280/${personData.profile_path}`}
								/>
							</div>
						</div>
						<div className="person--details">
							<h1 className="single-title">{personData.name}</h1>
							<p>{personData.place_of_birth}</p>
							<p>{personData.known_for_department}</p>
						</div>

						{/* {personData.images.profiles.map((image) => {
						return (
							<img
								src={`https://image.tmdb.org/t/p/w1280/${image.file_path}`}
							/>
						);
					})} */}
					</div>
					<section>
						<div className="person--bio">
							<h3 className="sub-title mb--1">Biography</h3>
							<div className="bio">
								{personData.biography.split('\n').map((str) => (
									<p>{str}</p>
								))}
							</div>
						</div>
					</section>
					{movieActing ? (
						<section>
							<h3 className="sub-title mb--1">Movies (Acting)</h3>
							<Carousel>
								{Object.keys(movieActing).map((key, i) => {
									let result = movieActing[key];
									if (result.popularity < 10) return null; // threshold to display
									return (
										<MovieCard
											key={result.id + '-cast-' + i}
											movie={result}
											character={result.character}
										/>
									);
								})}
							</Carousel>
						</section>
					) : null}
					{movieProduction ? (
						<section>
							<h3 className="sub-title mb--1">
								Movies (Production)
							</h3>
							<Carousel>
								{Object.keys(movieProduction).map((key, i) => {
									let result = movieProduction[key];
									if (result.popularity < 10) return null; // threshold to display
									return (
										<MovieCard
											key={result.id + '-cast-' + i}
											movie={result}
											character={result.job}
										/>
									);
								})}
							</Carousel>
						</section>
					) : null}
					{tvActing ? (
						<section>
							<h3 className="sub-title mb--1">Shows (Acting)</h3>
							<Carousel>
								{Object.keys(tvActing).map((key, i) => {
									let result = tvActing[key];
									if (result.popularity < 10) return null; // threshold to display
									return (
										<TvCard
											key={result.id + '-cast-' + i}
											series={result}
											character={result.character}
										/>
									);
								})}
							</Carousel>
						</section>
					) : null}
					{tvProduction ? (
						<section>
							<h3 className="sub-title mb--1">
								Shows (Production)
							</h3>
							<Carousel>
								{Object.keys(tvProduction).map((key, i) => {
									let result = tvProduction[key];
									if (result.popularity < 10) return null; // threshold to display
									return (
										<TvCard
											key={result.id + '-cast-' + i}
											series={result}
											character={result.job}
										/>
									);
								})}
							</Carousel>
						</section>
					) : null}
				</div>
			</>
		);
	}
}

Actor = withRouter(Actor);

function ActorContainer(props) {
	return <Actor mediabutler={props.mediabutler} />;
}

const mapStateToProps = function (state) {
	return {
		mediabutler: state.mediabutler,
	};
};

export default connect(mapStateToProps)(ActorContainer);
