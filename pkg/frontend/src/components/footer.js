import styles from '../styles/components/footer.module.scss';
import typo from '../styles/components/typography.module.scss';

import { ReactComponent as Logo } from '../assets/svg/logo.svg';
import { ReactComponent as Tmdb } from '../assets/svg/tmdb.svg';

import pjson from '../../package.json';
import { getGenres } from '../helpers/genres';
import { Link } from 'react-router-dom';

export default function Footer() {
	const movieGenres = getGenres('movie');
	const tvGenres = getGenres('tv');
	let movieGenresSorted = {};
	Object.keys(movieGenres).forEach((id) => {
		movieGenresSorted[movieGenres[id]] = id;
	});
	let tvGenresSorted = {};
	Object.keys(tvGenres).forEach((id) => {
		tvGenresSorted[tvGenres[id]] = id;
	});
	return (
		<div className={styles.footer}>
			<div className="container">
				<div className={styles.inner}>
					<div className={styles.inner__content}>
						<div className={styles.col1}>
							<div className={styles.logo}>
								<Logo />
							</div>
							<p className={typo.body}>{pjson.version}</p>
						</div>
						<div className={styles.col2}>
							<p
								className={`${typo.body} ${typo.uppercase} ${typo.bold}`}
							>
								Movie Genres
							</p>
							<div className={styles.links}>
								{Object.keys(movieGenresSorted)
									.sort()
									.map((name) => {
										return (
											<p
												key={`footer_movie_genre_${name}`}
												className={`${typo.body}`}
											>
												<Link
													to={`/movie/genre/${movieGenresSorted[name]}`}
												>
													{name}
												</Link>
											</p>
										);
									})}
							</div>
						</div>
						<div className={styles.col3}>
							<p
								className={`${typo.body} ${typo.uppercase} ${typo.bold}`}
							>
								TV Genres
							</p>
							<div className={styles.links}>
								{Object.keys(tvGenresSorted)
									.sort()
									.map((name) => {
										return (
											<p
												key={`footer_tv_genre_${name}`}
												className={`${typo.body}`}
											>
												<Link
													to={`/tv/genre/${tvGenresSorted[name]}`}
												>
													{name}
												</Link>
											</p>
										);
									})}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
