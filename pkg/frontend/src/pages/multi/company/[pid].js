import { useEffect, useState } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/opacity.css';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';

import NotFound from '../../404';
import Grid from '../../../components/grid';
import Hero from '../../../components/hero';
import { Loading } from '../../../components/loading';
import Meta from '../../../components/meta';
import media from '../../../services/media.service';
import hero from '../../../styles/components/hero.module.scss';
import styles from '../../../styles/views/company.module.scss';

const mapStateToProps = (state) => {
  return {
    redux_studios: state.media.studios,
    redux_networks: state.media.networks,
    redux_studioData: state.media.studioData,
    redux_networkData: state.media.networkData,
  };
};

function Company({
  newNotification,
  type,
  redux_studios,
  redux_studioData,
  redux_networks,
  redux_networkData,
}) {
  const [companyName, setCompanyName] = useState(null);
  const [companyLogo, setCompanyLogo] = useState(null);
  const [total, setTotal] = useState(1);
  const [featured, setFeatured] = useState(false);
  const { pid } = useParams();
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [error, setError] = useState(false);
  const companyData =
    type === 'studio'
      ? redux_studioData[pid] || null
      : redux_networkData[pid] || null;
  const companyInfo =
    type === 'studio'
      ? redux_studios[pid] || null
      : redux_networks[pid] || null;

  useEffect(() => {
    if (companyData) {
      if (companyData.results) setFeatured(companyData.results[0]);
      setPage(companyData.page);
      setTotal(companyData.total_pages);
    }
  }, [companyData]);

  useEffect(() => {
    if (companyInfo) {
      setCompanyName(companyInfo.name);
      setCompanyLogo(companyInfo.logo_path);
    }
  }, [companyInfo]);

  useEffect(() => {
    async function getCoDetails() {
      try {
        await media.companyLookup(type, 1, pid);
        if (type === 'studio') {
          await media.getStudio(pid);
        } else {
          await media.getNetwork(pid);
        }
      } catch (e) {
        console.log(e);
        setError(true);
      }
    }

    getCoDetails();
  }, [pid, type]);

  useEffect(() => {
    async function loadMore() {
      if (loadingMore || page === total) return;
      try {
        setLoadingMore(true);
        await media.companyLookup(type, page + 1, pid);
        setLoadingMore(false);
      } catch (e) {
        console.log(e);
      }
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
  }, [loadingMore, page, total, pid, type]);

  // if (!coData) return <Loading />;

  if (error) return <NotFound />;

  return (
    <div className={styles.wrap} key={`${type}_single_${pid}`}>
      <Meta title={companyName || 'Loading'} />
      <div className={`${hero.discovery} ${hero.company}`}>
        <div className="container">
          <div
            className={`${hero.discovery__content} ${hero.company__content}`}
          >
            <div className={hero.company__logo}>
              {companyLogo ? (
                <LazyLoadImage
                  src={`https://image.tmdb.org/t/p/w780_filter(duotone,ffffff,bdbdbd)${companyLogo}`}
                  alt={companyName || ' '}
                  effect="opacity"
                  visibleByDefault={true}
                />
              ) : (
                <p>{companyName || ' '}</p>
              )}
            </div>
          </div>
        </div>
        <div className={hero.company__background}>
          {featured ? (
            <Hero
              className={hero.discovery__image}
              image={featured.backdrop_path}
            />
          ) : null}
        </div>
      </div>
      <Grid
        title={`${companyName} ${type === 'network' ? 'Shows' : 'Movies'}`}
        data={companyData ? companyData.results : null}
        type={type === 'network' ? 'tv' : 'movie'}
        key={`${type}_${pid}_${type === 'network' ? 'tv' : 'movie'}`}
        id={`${type}_${pid}_${type === 'network' ? 'tv' : 'movie'}`}
        newNotification={newNotification}
      />
    </div>
  );
}

export default connect(mapStateToProps)(Company);
