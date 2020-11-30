import React from 'react';
import CarouselLoading from '../components/CarouselLoading';
import CarouselLoadingPerson from '../components/CarouselLoadingPerson';

class MovieShowLoading extends React.Component {
	render() {
		return (
			<div className="movie-wrap">
				<div className="movie-top">
					<div className="movie-backdrop">
						<div className="no-backdrop"></div>
					</div>
					<div className="movie-poster">
						<div className="movie-poster--inner"></div>
					</div>
					<div className="movie-details">
						<span></span>
						<div className="movie-details--top">
							<div className="movie-logo placeholder"></div>
						</div>
						<div className="movie--actions">
							<div className="btn btn__square placeholder"></div>
							<div className="btn btn__square placeholder"></div>
						</div>
					</div>
				</div>
				<div className="movie-content">
					<section>
						<div className="quick-view">
							<div className="side-content">
								<div className="movie-action">
									<div className="btn btn__square placeholder"></div>
									<div className="btn btn__square placeholder"></div>
								</div>
							</div>
							<div className="info">
								<div className="details text-placeholder"></div>
								<div className="movie-action__mobile">
									<div className="btn btn__square placeholder"></div>
									<div className="btn btn__square placeholder"></div>
								</div>
								<div className="movie-crew">
									<div className="movie-crew--item text-placeholder"></div>
									<div className="movie-crew--item text-placeholder"></div>
								</div>
								<div className="sub-title mb--1 text-placeholder"></div>
								<div className="overview text-placeholder"></div>
							</div>
						</div>
					</section>
					<section>
						<h3 className="sub-title mb--1 text-placeholder"></h3>
						<CarouselLoadingPerson />
					</section>
					<section>
						<h3 className="sub-title mb--1 text-placeholder"></h3>
						<CarouselLoading />
					</section>
				</div>
			</div>
		);
	}
}

export default MovieShowLoading;
