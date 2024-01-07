import { useEffect, useState } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/opacity.css';
import { useParams } from 'react-router-dom';

import NotFound from '../../404';
import Grid from '../../../components/grid';
import Hero from '../../../components/hero';
import { Loading } from '../../../components/loading';
import Meta from '../../../components/meta';
import media from '../../../services/media.service';
import hero from '../../../styles/components/hero.module.scss';
import styles from '../../../styles/views/company.module.scss';

export default function Studio({ newNotification }) {
  const [coData, setCoData] = useState(null);
  const [movies, setMovies] = useState(false);
  const [total, setTotal] = useState(1);
  const [featuredMovie, setFeaturedMovie] = useState(false);
  const { pid } = useParams();
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState(null);

  useEffect(() => {
    async function getCoDetails() {
      try {
        const movieData = await media.getCompany(pid);
        const moviesLookup = await media.lookup('movie', 1, {
          with_companies: pid,
        });
        setCoData(movieData);
        setQuery({
          with_companies: pid,
        });
        setMovies(moviesLookup.results);
        setTotal(moviesLookup.totalPages);
        setFeaturedMovie(moviesLookup.results[0]);
      } catch (e) {
        console.log(e);
        setCoData('error');
      }
    }

    getCoDetails();
  }, [pid]);

  useEffect(() => {
    async function loadMore() {
      if (loadingMore || !query || page === total) return;
      setLoadingMore(true);
      const moviesLookup = await media.lookup('movie', page + 1, query);
      setMovies([...movies, ...moviesLookup.results]);
      setPage(page + 1);
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
  }, [loadingMore, query, page, total, movies]);

  if (!coData) return <Loading />;

  if (coData === 'error') return <NotFound />;

  return (
    <div className={styles.wrap} key={`company_single_${pid}`}>
      <Meta title={coData.name} />
      <div className={`${hero.discovery} ${hero.company}`}>
        <div className="container">
          <div
            className={`${hero.discovery__content} ${hero.company__content}`}
          >
            <div className={hero.company__logo}>
              {coData.logo_path ? (
                <LazyLoadImage
                  src={`https://image.tmdb.org/t/p/w780_filter(duotone,ffffff,bdbdbd)${coData.logo_path}`}
                  alt={coData.name}
                  effect="opacity"
                  visibleByDefault={true}
                />
              ) : (
                <p>{coData.name}</p>
              )}
            </div>
          </div>
        </div>
        <div className={hero.company__background}>
          {featuredMovie ? (
            <Hero
              className={hero.discovery__image}
              image={featuredMovie.backdrop_path}
            />
          ) : null}
        </div>
      </div>
      <Grid
        title={`${coData.name} Movies`}
        data={movies}
        type="movie"
        key={`company_${pid}_movies`}
        id={`company_${pid}_movies`}
        newNotification={newNotification}
      />
    </div>
  );
}
