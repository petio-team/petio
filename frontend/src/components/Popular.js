import React from 'react';
import { withRouter, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import Plex from '../data/Plex';
import Api from '../data/Api';
// import User from '../data/User'
import MovieCard from './MovieCard';
import TvCard from './TvCard';
import Carousel from './Carousel';
import CarouselLoading from './CarouselLoading';

class Popular extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			libraries: this.props.user.library_index,
			credentials: false,
			topData: false,
		};

		this.getTop = this.getTop.bind(this);
		this.init = this.init.bind(this);
	}

	componentDidMount() {
		this.init();
	}

	// componentDidUpdate() {
	// 	this.init();
	// }

	init() {
		if (!this.state.topData) {
			this.getTop('movies');
		}
	}

	getTop() {
		Api.top(this.props.type)
			.then((res) => {
				this.setState({
					topData: res,
				});
			})
			.catch((err) => {
				console.log(err);
			});
	}

	render() {
		if (this.props.type === 'movie') {
			let topData = (
				<>
					<section>
						<h3 className="sub-title mb--1">Popular on Plex</h3>
						{this.state.topData ? (
							<Carousel>
								{Object.keys(this.state.topData).map((t) => {
									if (
										!this.state.topData[t].item.tmdb_id ||
										this.state.topData[t].item.tmdb_id ===
											'false'
									) {
										return null;
									}
									return (
										<div key={t} className="popular-card">
											<p className="popular-card--count">
												{
													this.state.topData[t]
														.globalViewCount
												}
											</p>
											<MovieCard
												key={
													this.state.topData[t].item
														.tmdb_id
												}
												movie={{
													id: this.state.topData[t]
														.item.tmdb_id,
												}}
											/>
										</div>
									);
								})}
							</Carousel>
						) : (
							<CarouselLoading />
						)}
					</section>
				</>
			);
			return topData;
		} else {
			let topShows = (
				<>
					<section>
						<h3 className="sub-title mb--1">Popular on Plex</h3>
						{this.state.topData ? (
							<Carousel>
								{Object.keys(this.state.topData).map((t) => {
									if (
										!this.state.topData[t].item.tmdb_id ||
										this.state.topData[t].item.tmdb_id ===
											'false'
									) {
										return null;
									}
									return (
										<div
											key={
												this.state.topData[t].item
													.tmdb_id
											}
											className="popular-card"
										>
											<p className="popular-card--count">
												{
													this.state.topData[t]
														.globalViewCount
												}
											</p>
											<TvCard
												key={this.state.topData[t].id}
												series={{
													id: this.state.topData[t]
														.item.tmdb_id,
												}}
											/>
										</div>
									);
								})}
							</Carousel>
						) : (
							<CarouselLoading />
						)}
					</section>
				</>
			);
			return topShows;
		}
	}
}

Popular = withRouter(Popular);

function PopularContainer(props) {
	return <Popular user={props.user} type={props.type} />;
}

const mapStateToProps = function (state) {
	return {
		user: state.user,
	};
};

export default connect(mapStateToProps)(PopularContainer);
