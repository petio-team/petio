import React from 'react';
import { withRouter, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import Mediabutler from '../data/Mediabutler';
import { ReactComponent as SearchIcon } from '../assets/svg/search.svg';
import MovieCard from '../components/MovieCard';
import TvCard from '../components/TvCard';
import Carousel from '../components/Carousel';
import PersonCard from '../components/PersonCard';
import CarouselLoading from '../components/CarouselLoading';
import CarouselLoadingPerson from '../components/CarouselLoadingPerson';

class Search extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			searchTerm: '',
			searchActive: false,
			isLoading: false,
		};

		this.handleChange = this.handleChange.bind(this);
	}

	handleChange(e) {
		if (e.currentTarget.value.length > 2) {
			let term = e.currentTarget.value;
			this.setState({
				isLoading: true,
			});
			// throttle search lookup during constant typing
			setTimeout(() => {
				if (term === this.state.searchTerm) {
					this.setState({
						isLoading: true,
					});
					Mediabutler.search(term)
						.then(() => {
							this.setState({
								isLoading: false,
							});
						})
						.catch(() => {
							this.setState({
								isLoading: false,
							});
						});
				}
			}, 500);
			this.setState({
				searchTerm: e.currentTarget.value,
				searchActive: true,
			});
		} else {
			Mediabutler.clearSearch();
			this.setState({
				searchTerm: e.currentTarget.value,
				searchActive: false,
				isLoading: false,
			});
		}
	}

	componentDidMount() {
		Mediabutler.getPopular();

		let page = document.querySelectorAll('.page-wrap')[0];
		page.scrollTop = 0;
		window.scrollTo(0, 0);
	}

	render() {
		let searchResults = (
			<>
				<section>
					<h3 className="sub-title mb--1">Movies</h3>
					{this.props.mediabutler.search_results.movies.length > 0 ? (
						<Carousel>
							{this.props.mediabutler.search_results.movies.map(
								(movie) => {
									return (
										<MovieCard
											key={movie.id}
											movie={movie}
										/>
									);
								}
							)}
						</Carousel>
					) : this.state.isLoading ? (
						<CarouselLoading />
					) : (
						<p>No results</p>
					)}
				</section>
				<section>
					<h3 className="sub-title mb--1">Shows</h3>
					{this.props.mediabutler.search_results.series.length > 0 ? (
						<Carousel>
							{this.props.mediabutler.search_results.series.map(
								(series) => {
									return (
										<TvCard
											key={series.id}
											series={series}
										/>
									);
								}
							)}
						</Carousel>
					) : this.state.isLoading ? (
						<CarouselLoading />
					) : (
						<p>No results</p>
					)}
				</section>
				<section>
					<h3 className="sub-title mb--1">People</h3>
					{this.props.mediabutler.search_results.people.length > 0 ? (
						<Carousel>
							{this.props.mediabutler.search_results.people.map(
								(person) => {
									return (
										<PersonCard
											key={person.id}
											person={person}
										/>
									);
								}
							)}
						</Carousel>
					) : this.state.isLoading ? (
						<CarouselLoadingPerson />
					) : (
						<p>No results</p>
					)}
				</section>
			</>
		);
		let trending = (
			<>
				<section>
					<h3 className="sub-title mb--1">Trending Movies</h3>
					{Object.keys(this.props.mediabutler.popular).length > 0 ? (
						<Carousel>
							{Object.keys(this.props.mediabutler.popular)
								.length > 0
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
					) : (
						<CarouselLoading />
					)}
				</section>
				<section>
					<h3 className="sub-title mb--1">Trending Shows</h3>
					{Object.keys(this.props.mediabutler.popular).length > 0 ? (
						<Carousel>
							{Object.keys(this.props.mediabutler.popular)
								.length > 0
								? this.props.mediabutler.popular.tv.map(
										(series) => {
											return (
												<TvCard
													key={series.id}
													series={series}
												/>
											);
										}
								  )
								: null}
						</Carousel>
					) : (
						<CarouselLoading />
					)}
				</section>
				<section>
					<h3 className="sub-title mb--1">Trending People</h3>
					<Carousel>
						{Object.keys(this.props.mediabutler.popular).length > 0
							? this.props.mediabutler.popular.people.map(
									(person) => {
										return (
											<PersonCard
												key={person.id}
												person={person}
											/>
										);
									}
							  )
							: null}
					</Carousel>
				</section>
			</>
		);
		return (
			<div className="search-wrap">
				<section>
					<h1 className="main-title mb--1">Search</h1>
					<div className="search-form">
						<input
							type="text"
							placeholder="Search"
							value={this.state.searchTerm}
							onChange={this.handleChange}
						/>
						<button className="search-btn">
							<SearchIcon />
						</button>
					</div>
				</section>
				{this.state.searchActive ? searchResults : trending}
			</div>
		);
	}
}

Search = withRouter(Search);

function SearchContainer(props) {
	return <Search mediabutler={props.mediabutler} />;
}

const mapStateToProps = function (state) {
	return {
		mediabutler: state.mediabutler,
	};
};

export default connect(mapStateToProps)(SearchContainer);
