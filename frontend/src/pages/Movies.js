import React from 'react';
import { withRouter, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import Mediabutler from '../data/Mediabutler';
import Popular from '../components/Popular';
import History from '../components/History';
import MovieCard from '../components/MovieCard';
import Carousel from '../components/Carousel';

class Movies extends React.Component {
	componentDidMount() {
		let page = document.querySelectorAll('.page-wrap')[0];
		page.scrollTop = 0;
		window.scrollTo(0, 0);

		if (!Object.keys(this.props.mediabutler.popular).length > 0) {
			Mediabutler.getPopular();
		}
	}
	render() {
		return (
			<>
				<h1 className="main-title mb--1">Movies</h1>
				<Popular type="movie" />
				<History type="movie" />
				<section>
					<h3 className="sub-title mb--1">Trending Movies</h3>
					<Carousel>
						{Object.keys(this.props.mediabutler.popular).length > 0
							? this.props.mediabutler.popular.movies.map(
									(movie) => {
										return (
											<MovieCard
												key={movie.id}
												movie={movie}
											/>
										);
									}
							  )
							: null}
					</Carousel>
				</section>
			</>
		);
	}
}

Movies = withRouter(Movies);

function MoviesContainer(props) {
	return <Movies mediabutler={props.mediabutler} />;
}

const mapStateToProps = function (state) {
	return {
		mediabutler: state.mediabutler,
	};
};

export default connect(mapStateToProps)(MoviesContainer);
