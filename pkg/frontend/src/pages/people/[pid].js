import media from '../../services/media.service';

import { useState, useEffect } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/opacity.css';
import { Link, useParams } from 'react-router-dom';
import { connect } from 'react-redux';

import styles from '../../styles/views/person.module.scss';
import typo from '../../styles/components/typography.module.scss';

import Meta from '../../components/meta';
import Carousel from '../../components/carousel';

const mapStateToProps = (state) => {
	return {
		redux_people: state.media.people,
	};
};

function Person({ redux_people }) {
	const [showMore, setShowMore] = useState(false);
	const { pid } = useParams();
	const personData = redux_people[pid];

	useEffect(() => {
		async function getPersonDetails() {
			try {
				media.getPerson(pid);
			} catch (e) {
				console.log(e);
			}
		}

		if (!pid) return;
		setShowMore(false);
		getPersonDetails();
	}, [pid]);

	if (!personData) return null;

	// if (personData === 'error') {
	// 	router.push('/404', null, { shallow: true });
	// 	return null;
	// }

	function sortByRanking(a, b) {
		if (a.ranking < b.ranking) {
			return 1;
		}
		if (a.ranking > b.ranking) {
			return -1;
		}
		return 0;
	}

	function processCredits(credits, items) {
		for (let i in items) {
			let item = items[i];
			if (!credits[item.id]) {
				let ranking = Math.round(item.popularity * item.vote_count);
				item.ranking = ranking;
				credits[item.id] = item;
				credits[item.id].characters = [];
				credits[item.id].jobs = [];
			}

			if (item.job) {
				credits[item.id].jobs.push(item.job);
			}
			if (item.character) {
				credits[item.id].characters.push(item.character);
			}
		}
		return credits;
	}

	function processCredit(item) {
		let credit = null;

		if (personData.known_for_department !== 'Acting') {
			// Not actor
			credit = '';
			let o = 0;

			if (item.jobs)
				item.jobs.map((job) => {
					if (o > 0) credit += ' / ';
					credit += job;
					o++;
				});
			if (item.characters)
				item.characters.map((role) => {
					if (o > 0) credit += ' / ';
					credit += role;
					o++;
				});
		} else {
			// actor
			credit = '';
			let o = 0;
			if (item.characters)
				item.characters.map((role) => {
					if (o > 0) credit += ' / ';
					credit += role;
					o++;
				});
			if (item.jobs)
				item.jobs.map((job) => {
					if (o > 0) credit += ' / ';
					credit += job;
					o++;
				});
		}

		return credit;
	}

	// Credits Movie
	let movieCredits = personData.movies;
	let moviesList = false;

	if (movieCredits) {
		moviesList = {};
		moviesList = processCredits(moviesList, movieCredits.cast);
		moviesList = processCredits(moviesList, movieCredits.crew);
		moviesList = Object.values(moviesList);
		moviesList.sort(sortByRanking);
		Object.keys(moviesList).map((i) => {
			let movie = moviesList[i];
			movie.credit = processCredit(movie);
		});
	}

	// Credits TV
	let tvCredits = personData.tv;
	let showsList = false;

	if (tvCredits) {
		showsList = {};
		showsList = processCredits(showsList, tvCredits.cast);
		showsList = processCredits(showsList, tvCredits.crew);
		showsList = Object.values(showsList);
		showsList.sort(sortByRanking);
		Object.keys(showsList).map((i) => {
			let show = showsList[i];
			show.credit = processCredit(show);
		});
	}

	return (
		<div className={styles.wrap}>
			<Meta
				title={
					personData && personData.info ? personData.info.name : ''
				}
			/>
			<div className="container">
				<div className={styles.info}>
					<div className={styles.info__overview}>
						<div className={styles.info__title}>
							<p className={`${typo.title} ${typo.bold}`}>
								{personData && personData.info
									? personData.info.name
									: ''}
							</p>
						</div>
						<div className={styles.info__knownfor}>
							<p className={`${typo.body} ${typo.bold}`}>
								{personData.info.known_for_department}
							</p>
						</div>
						<div className={styles.info__biography}>
							<p className={typo.body}>
								{personData &&
								personData.info &&
								personData.info.biography
									? personData.info.biography.length > 800 &&
									  !showMore
										? `${personData.info.biography.substring(
												0,
												800
										  )} ...`
										: personData.info.biography
									: ''}
							</p>
							{personData &&
							personData.info &&
							personData.info.biography &&
							personData.info.biography.length > 800 ? (
								<div
									className={styles.info__biography__showmore}
									onClick={() => setShowMore(!showMore)}
								>
									<p
										className={`${styles.body} ${styles.uppercase} ${styles.bold}`}
									>
										{showMore ? 'Show less' : 'Show more'}
									</p>
								</div>
							) : null}
						</div>
					</div>
					{personData &&
					personData.info &&
					personData.info.images &&
					personData.info.images.profiles &&
					personData.info.images.profiles.length > 0 ? (
						<div className={styles.info__profile}>
							<div className={styles.info__profile__img}>
								{personData &&
								personData.info &&
								personData.info.images &&
								personData.info.images.profiles &&
								personData.info.images.profiles.length > 0 ? (
									<LazyLoadImage
										src={`https://image.tmdb.org/t/p/h632${personData.info.images.profiles[0].file_path}`}
										alt={personData.info.name}
										effect="opacity"
									/>
								) : (
									<p className={`${typo.title} ${typo.bold}`}>
										{personData.info.name}
									</p>
								)}
							</div>
						</div>
					) : null}
				</div>
			</div>
			<div className={styles.credits}>
				{moviesList ? (
					<Carousel
						title="Movies"
						data={moviesList}
						type="movie"
						key={`person_${pid}_movies`}
						id={`person_${pid}_movies`}
					/>
				) : null}
				{showsList ? (
					<Carousel
						title="Shows"
						data={showsList}
						type="tv"
						key={`person_${pid}_tv`}
						id={`person_${pid}_tv`}
					/>
				) : null}
			</div>
		</div>
	);
}

export default connect(mapStateToProps)(Person);
