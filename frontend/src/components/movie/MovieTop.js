import React from 'react';
import { ReactComponent as RequestIcon } from '../../assets/svg/request.svg';
import { ReactComponent as ReportIcon } from '../../assets/svg/report.svg';
import { ReactComponent as WatchIcon } from '../../assets/svg/play.svg';
import { ReactComponent as CheckIcon } from '../../assets/svg/check.svg';
import { LazyLoadImage } from 'react-lazy-load-image-component';

class MovieTop extends React.Component {
	render() {
		let watchBtn = this.props.movieData.onServer ? (
			<button className="btn btn__square good">
				<WatchIcon />
				Play
			</button>
		) : null;

		let requestBtn = this.props.movieData.on_server ? (
			<div className="btn btn__square good">
				<CheckIcon />
				On Plex
			</div>
		) : this.props.requested ? (
			<button
				className="btn btn__square blue"
				onClick={this.props.request}
			>
				{`Requested by ${this.props.requested} 
				${this.props.requested > 1 ? 'users' : 'user'}`}
			</button>
		) : (
			<button className="btn btn__square" onClick={this.props.request}>
				<RequestIcon />
				Request
			</button>
		);

		let reportBtn = (
			<button className="btn btn__square" onClick={this.props.openIssues}>
				<ReportIcon />
				Report an issue
			</button>
		);

		let video = this.props.movieData.videos.results
			? this.props.movieData.videos.results[0]
			: false;

		if (video) {
			if (video.site !== 'YouTube') {
				video = false;
			}
		}

		return (
			<div
				className={`movie-top ${
					this.props.trailer ? 'show-trailer' : ''
				}`}
			>
				<div
					className="movie-backdrop"
					key={`${this.props.movieData.title}__backdrop`}
				>
					{video && this.props.trailer ? (
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
					{this.props.movieData.backdrop_path ? (
						<LazyLoadImage
							src={
								'https://image.tmdb.org/t/p/w1280/' +
								this.props.movieData.backdrop_path
							}
							alt={this.props.movieData.title}
							effect="blur"
							key={`${this.props.movieData.title}__backdrop`}
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
						{this.props.movieData.poster_path ? (
							<LazyLoadImage
								src={
									'https://image.tmdb.org/t/p/w500/' +
									this.props.movieData.poster_path
								}
								alt={this.props.movieData.title}
								effect="blur"
								key={`${this.props.movieData.title}__poster`}
							/>
						) : null}
					</div>
				</div>
				<div className="movie-details">
					<span></span>
					<div className="movie-details--top">
						{this.props.movieData.logo ? (
							<LazyLoadImage
								className="movie-logo"
								src={this.props.movieData.logo}
							/>
						) : (
							<h1 className="single-title">
								{this.props.movieData.title}
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
		);
	}
}

export default MovieTop;
