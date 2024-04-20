import { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';

import NotFound from '../../404';
import Grid from '../../../components/grid';
import Hero from '../../../components/hero';
import Meta from '../../../components/meta';
import { matchGenre } from '../../../helpers/genres';
import media from '../../../services/media.service';
import hero from '../../../styles/components/hero.module.scss';
import typo from '../../../styles/components/typography.module.scss';
import styles from '../../../styles/views/genre.module.scss';

const mapStateToProps = (state) => {
  return {
    redux_genreData: state.media.genreData,
  };
};

function Genre({ type, newNotification, redux_genreData }) {
  const [genreName, setGenreName] = useState('');
  // const [movies, setMovies] = useState(false);
  const [total, setTotal] = useState(1);
  const [featuredMovie, setFeaturedMovie] = useState(false);
  const { pid } = useParams();
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState(null);
  const genreData = redux_genreData[pid] || null;

  console.log(genreData);

  useEffect(() => {
    if (genreData) {
      if (genreData.results) setFeaturedMovie(genreData.results[0]);
      setPage(genreData.page);
      setTotal(genreData.total_pages);
    }
  }, [genreData]);

  useEffect(() => {
    async function getGenreDetails() {
      try {
        const genreMatch = matchGenre(type, pid);
        if (!genreMatch || !genreMatch.query) throw 'not found';
        setGenreName(genreMatch.name);
        setQuery(genreMatch.query);
        await media.genreLookup(
          type === 'tv' ? 'show' : type,
          1,
          genreMatch.query,
          pid,
        );
      } catch (e) {
        console.log(e);
        setGenreName('error');
      }
    }

    getGenreDetails();
  }, [pid, type]);

  useEffect(() => {
    async function loadMore() {
      if (loadingMore || !query || page === total) return;
      setLoadingMore(true);
      await media.genreLookup(
        type === 'tv' ? 'show' : type,
        page + 1,
        query,
        pid,
      );
      setLoadingMore(false);
    }

    function handleScroll() {
      if (
        window.innerHeight * 2 + window.scrollY >=
        document.body.offsetHeight
      ) {
        // you're at the bottom of the page
        loadMore();
      }
    }

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [loadingMore, query, page, total, pid, type]);

  if (genreName === 'error') return <NotFound />;

  return (
    <div className={styles.wrap} key={`genre_single_${pid}`}>
      {!genreData ? (
        <>
          <Meta title="Loading" />
          <div className={`${hero.discovery} ${hero.genre}`}>
            <div className="container">
              <div
                className={`${hero.discovery__content} ${hero.genre__content}`}
              >
                <div className={hero.genre__title}>
                  <p className={`${typo.xltitle} ${typo.bold}`}>
                    {genreName
                      ? `${genreName} ${type === 'movie' ? 'Movies' : 'Shows'}`
                      : ' '}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <Grid
            title={
              genreName
                ? `${genreName} ${type === 'movie' ? 'Movies' : 'Shows'}`
                : ' '
            }
            type="movie"
            key={`genre_${pid}_${type}`}
            id={`genre_${pid}_${type}`}
            newNotification={newNotification}
          />
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
                  <p className={`${typo.xltitle} ${typo.bold}`}>
                    {genreName} {type === 'movie' ? 'Movies' : 'Shows'}
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
            title={`${genreName} ${type === 'movie' ? 'Movies' : 'Shows'}`}
            data={genreData.results}
            type={type}
            key={`genre_${pid}_${type}`}
            id={`genre_${pid}_${type}`}
            newNotification={newNotification}
          />
        </>
      )}
    </div>
  );
}

export default connect(mapStateToProps)(Genre);
