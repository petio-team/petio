import { Link } from 'react-router-dom';

import { getGenres } from '../helpers/genres';
import styles from '../styles/components/nav.module.scss';
import typo from '../styles/components/typography.module.scss';

export default function NavGenres({ open }) {
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

  if (!open) return null;

  return (
    <div className={`${styles.genre_menu}`}>
      <div className={styles.genre_menu__inner}>
        <div className="container">
          <div className={styles.genre_menu__content}>
            <div className={styles.genre_menu__col}>
              <p className={`${typo.body} ${typo.uppercase} ${typo.bold}`}>
                Movie Genres
              </p>
              <div className={styles.genre_menu__links}>
                {Object.keys(movieGenresSorted)
                  .sort()
                  .map((name) => {
                    return (
                      <p
                        key={`footer_movie_genre_${name}`}
                        className={`${typo.body}`}
                      >
                        <Link to={`/movie/genre/${movieGenresSorted[name]}`}>
                          {name}
                        </Link>
                      </p>
                    );
                  })}
              </div>
            </div>
            <div className={styles.genre_menu__col}>
              <p className={`${typo.body} ${typo.uppercase} ${typo.bold}`}>
                TV Genres
              </p>
              <div className={styles.genre_menu__links}>
                {Object.keys(tvGenresSorted)
                  .sort()
                  .map((name) => {
                    return (
                      <p
                        key={`footer_tv_genre_${name}`}
                        className={`${typo.body}`}
                      >
                        <Link to={`/tv/genre/${tvGenresSorted[name]}`}>
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
