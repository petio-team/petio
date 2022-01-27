import media from '../../../services/media.service';

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import hero from '../../../styles/components/hero.module.scss';
import styles from '../../../styles/views/genre.module.scss';
import typo from '../../../styles/components/typography.module.scss';

import Meta from '../../../components/meta';
import Hero from '../../../components/hero';
import Grid from '../../../components/grid';
import { matchGenre } from '../../../helpers/genres';
import NotFound from '../../404';

export default function Genre() {
	const [genreName, setGenreName] = useState('');
	const [movies, setMovies] = useState(false);
	const [total, setTotal] = useState(1);
	const [featuredMovie, setFeaturedMovie] = useState(false);
	const { pid } = useParams();

	useEffect(() => {
		async function getGenreDetails() {
			try {
				const genreMatch = matchGenre('movie', pid);
				if (!genreMatch || !genreMatch.query) throw 'not found';
				setGenreName(genreMatch.name);
				const moviesLookup = await media.lookup(
					'movie',
					1,
					genreMatch.query
				);
				setMovies(moviesLookup.results);
				setTotal(moviesLookup.totalPages);
				setFeaturedMovie(moviesLookup.results[0]);
			} catch (e) {
				console.log(e);
				setGenreName('error');
			}
		}

		getGenreDetails();
	}, [pid]);

	if (genreName === 'error') return <NotFound />;

	return (
		<div className={styles.wrap} key={`genre_single_${pid}`}>
			{!genreName ? (
				<>
					<Meta title="Loading" />
					<div className={`${hero.discovery} ${hero.genre}`}>
						<div className="container">
							<div
								className={`${hero.discovery__content} ${hero.genre__content}`}
							>
								<div className={hero.genre__title}>
									<p
										className={`${typo.xltitle} ${typo.bold}`}
									>
										Loading
									</p>
								</div>
							</div>
						</div>
					</div>
				</>
			) : (
				<>
					<Meta title={genreName} />
					<div className={`${hero.discovery} ${hero.genre}`}>
						<div className="container">
							<div
								className={`${hero.discovery__content} ${hero.genre__content}`}
							>
								<div className={hero.genre__title}>
									<p
										className={`${typo.xltitle} ${typo.bold}`}
									>
										{genreName} Movies
									</p>
								</div>
							</div>
						</div>
						<div className={hero.genre__background}>
							{featuredMovie ? (
								<Hero
									className={hero.discovery__image}
									image={featuredMovie.backdrop_path}
								/>
							) : null}
						</div>
					</div>
					<Grid
						title={`${genreName} Movies`}
						data={movies}
						type="movie"
						key={`genre_${pid}_movies`}
						id={`genre_${pid}_movies`}
					/>
				</>
			)}
		</div>
	);
}
