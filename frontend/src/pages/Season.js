import React from 'react';
import { withRouter, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import Api from '../data/Api';

class Season extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			onServer: false,
			show: this.props.match.params.id,
			season: this.props.match.params.season,
			requested: false,
		};

		this.daysTillAir = this.daysTillAir.bind(this);
	}

	componentDidMount() {
		let page = document.querySelectorAll('.page-wrap')[0];
		page.scrollTop = 0;
		window.scrollTo(0, 0);
		let id = this.props.match.params.id;
		let season = this.props.match.params.season;

		if (!this.props.api.series_lookup[id]) {
			// check for cached
			Api.series(id);
		} else if (this.props.api.series_lookup[id].isMinified) {
			Api.series(id);
		}
	}

	daysTillAir(airDate) {
		var oneDay = 24 * 60 * 60 * 1000;
		var secondDate = new Date();
		var firstDate = new Date(airDate);
		let days = Math.round(
			Math.abs(
				(firstDate.setHours(0, 0, 0, 0) -
					secondDate.setHours(0, 0, 0, 0)) /
					oneDay
			)
		);

		if (firstDate < secondDate) {
			return 'Has aired on tv';
		}

		return days < 100
			? 'airs in ' + days + ' ' + (days > 1 ? 'days' : 'day')
			: 'Not yet aired';
	}

	render() {
		let id = this.props.match.params.id;
		let season = this.props.match.params.season;
		let seriesData = this.props.api.series_lookup[id];
		let seasonData = this.props.api.series_lookup[id]
			? this.props.api.series_lookup[id].seasonData[season]
			: false;
		console.log(seasonData);
		let now = new Date();
		now.setHours(0, 0, 0, 0);
		if (!seriesData || !seasonData) {
			return (
				<div className="page-wrap">
					<p>Loading...</p>
				</div>
			);
		} else {
			if (seriesData.isMinified) {
				return <p>Loading...</p>;
			}
			return (
				<div
					className="page-wrap season-wrap"
					style={{
						backgroundImage:
							'url(https://image.tmdb.org/t/p/original/' +
							seriesData.backdrop_path +
							')',
					}}
				>
					<div className="season-inner">
						<div className="season-details">
							<div className="stick">
								<div>
									<Link
										to={`/series/${id}`}
										className="btn btn__square"
									>
										{seriesData.name}
									</Link>
								</div>
								{seriesData.logo ? (
									<div>
										<img
											class="series-logo__small"
											src={seriesData.logo}
										/>
									</div>
								) : null}
								<h1 className="main-title">
									{seasonData.name}
								</h1>
								<p className="overview">
									{seasonData.overview}
								</p>
							</div>
						</div>
						<div className="season-episodes">
							<div className="season-episodes-inner">
								{seasonData.episodes.map((episode) => {
									let airDate = episode.air_date
										? Date.parse(episode.air_date)
										: false;

									return (
										<div
											className={
												'season-episode ' +
												(airDate < now
													? 'aired'
													: 'not-aired')
											}
										>
											<div className="season-episode--img">
												<img
													src={`https://image.tmdb.org/t/p/w500/${episode.still_path}`}
												/>
											</div>
											<div className="season-episode--info">
												<p className="upper small ep-num">
													Season{' '}
													{episode.season_number}:
													Episode{' '}
													{episode.episode_number} -{' '}
													{this.daysTillAir(airDate)}
												</p>
												<h4 className="sub-title">
													{episode.name}
												</h4>
												<p className="small detail">
													{episode.overview}
												</p>
											</div>
											<div className="season-episode--actions">
												<button className="btn btn__square">
													Request
												</button>
												<button className="btn btn__square">
													Report an issue
												</button>
											</div>
										</div>
									);
								})}
							</div>
						</div>
					</div>
				</div>
			);
		}
	}
}

Season = withRouter(Season);

function SeasonContainer(props) {
	return <Season api={props.api} />;
}

const mapStateToProps = function (state) {
	return {
		api: state.api,
	};
};

export default connect(mapStateToProps)(SeasonContainer);
