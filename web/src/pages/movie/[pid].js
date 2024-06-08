import { useEffect, useState } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/opacity.css';
import { connect } from 'react-redux';
import { Link, useParams } from 'react-router-dom';

import NotFound from '../404';
import { ReactComponent as IssueIcon } from '../../assets/svg/issue.svg';
import { ReactComponent as TrailerIcon } from '../../assets/svg/v1/trailer.svg';
import { ReactComponent as WatchlistIcon } from '../../assets/svg/watchlist.svg';
import Carousel from '../../components/Carousel';
import Critics from '../../components/critics';
import Hero from '../../components/hero';
import IssueModal from '../../components/issueModal';
import { Loading } from '../../components/loading';
import Meta from '../../components/meta';
import RequestButton from '../../components/requestButton';
import ReviewButtons from '../../components/reviewButtons';
import Trailer from '../../components/trailer';
import { matchGenre } from '../../helpers/genres';
import languages from '../../helpers/languages';
import media from '../../services/media.service';
import { getReviews } from '../../services/user.service';
import buttons from '../../styles/components/button.module.scss';
import hero from '../../styles/components/hero.module.scss';
import typo from '../../styles/components/typography.module.scss';
import styles from '../../styles/views/movie.module.scss';

const mapStateToProps = (state) => {
  return {
    redux_movies: state.media.movies,
    redux_requests: state.user.requests,
    redux_reviews: state.user.reviews,
  };
};

function Movie({
  currentUser,
  updateRequests,
  newNotification,
  redux_movies,
  redux_requests,
  redux_reviews,
}) {
  const [mobile, setMobile] = useState(false);
  const [trailer, setTrailer] = useState(false);
  const [issuesOpen, setIssuesOpen] = useState(false);
  const { pid } = useParams();
  const movieData = redux_movies[pid];
  const [collection, setCollection] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    function handleResize() {
      setMobile(window.innerWidth < 992);
    }
    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // sort collection
    if (!movieData) return;
    const collectionData = movieData.collection;
    if (!collectionData) return;
    const collectionRedux = [];
    collectionData.forEach((id) => {
      if (!redux_movies[id]) return;
      if (!redux_movies[id].release_date)
        redux_movies[id].release_date = '999999999';
      collectionRedux.push(redux_movies[id]);
    });

    const collectionSorted = collectionRedux.sort(sortCollection);

    function sortCollection(a, b) {
      if (a.release_date < b.release_date) {
        return -1;
      }
      if (a.release_date > b.release_date) {
        return 1;
      }
      return 0;
    }
    setCollection(collectionSorted);
  }, [redux_movies, movieData]);

  useEffect(() => {
    async function getMovieDetails() {
      try {
        await media.getMovie(pid);
        getReviews();
      } catch (e) {
        setError(true);
        console.log(e);
      }
    }
    if (!pid) return;
    getMovieDetails();
  }, [pid]);

  function timeConvert(n) {
    var num = n;
    var hours = num / 60;
    var rhours = Math.floor(hours);
    var minutes = (hours - rhours) * 60;
    var rminutes = ('0' + Math.round(minutes)).slice(-2);
    var hrs = rhours < 1 ? '' : rhours === 1 ? ' h ' : rhours > 1 ? ' h ' : '';
    return `${rhours >= 1 ? rhours : ''}${hrs}${rminutes} mins`;
  }

  function filterCrew() {
    let out = [];
    if (movieData && movieData.credits && movieData.credits.crew) {
      const crew = movieData.credits.crew;
      let directors = crew.filter((obj) => obj.job === 'Director');
      let authors = crew.filter((obj) => obj.job === 'Novel');
      let writers = crew.filter((obj) => obj.job === 'Screenplay');
      let eProducers = crew.filter((obj) => obj.job === 'Executive Producer');
      let producers = crew.filter((obj) => obj.job === 'Producer');
      let unsorted = [
        ...directors,
        ...authors,
        ...writers,
        ...eProducers,
        ...producers,
      ];
      unsorted.forEach((item) => {
        const exists = out.filter((obj) => obj.name === item.name);
        if (exists.length > 0) {
          exists[0].roles = [...exists[0].roles, item.job];
        } else {
          out = [
            ...out,
            {
              name: item.name,
              id: item.id,
              roles: [item.job],
            },
          ];
        }
      });
    }
    return out;
  }

  function renderCredits() {
    let out = [];
    for (let i = 0; i < 4; i++) {
      out.push(
        <div
          key={`credits_${pid}_${i}`}
          className={
            mobile
              ? styles.details__content__item
              : styles.overview__credits__item
          }
        >
          <p
            className={
              mobile
                ? `${typo.body} ${typo.bold} ${styles.details__content__item__title}`
                : `${typo.body} ${typo.bold} ${typo.uppercase}`
            }
          >
            {mobile ? (
              credits.length > i && credits[i].roles.length > 0 ? (
                credits[i].roles.map((role, r) => {
                  if (r > 0) {
                    return ', ' + role;
                  }
                  return role;
                })
              ) : null
            ) : credits.length > i ? (
              <Link to={`/people/${credits[i].id}`}>{credits[i].name}</Link>
            ) : null}
          </p>
          <p className={mobile ? typo.body : `${typo.body} ${typo.uppercase}`}>
            {mobile ? (
              credits.length > i ? (
                <Link to={`/people/${credits[i].id}`}>{credits[i].name}</Link>
              ) : null
            ) : credits.length > i && credits[i].roles.length > 0 ? (
              credits[i].roles.map((role, r) => {
                if (r > 0) {
                  return ', ' + role;
                }
                return role;
              })
            ) : null}
          </p>
        </div>,
      );
    }
    return out;
  }

  function formatLang(code) {
    const match = languages.filter((l) => l.code === code);
    if (match && match[0]) {
      return match[0].name;
    } else {
      return 'Unknown';
    }
  }

  if (error) {
    return <NotFound />;
  }

  const credits = filterCrew();
  const logo = movieData.logo?.includes(`https://assets.fanart.tv`) ? movieData.logo : `https://image.tmdb.org/t/p/original/${movieData.logo}`;

  return (
    <div className={styles.wrap} key={`movie_single_${pid}`}>
      <Meta title={movieData ? movieData.title : ''} />
      <IssueModal
        data={movieData}
        type="movie"
        issuesOpen={issuesOpen}
        setIssuesOpen={setIssuesOpen}
        newNotification={newNotification}
        currentUser={currentUser}
      />
      {!movieData || !movieData.ready || !pid ? <Loading /> : null}
      <div className={hero.single}>
        {trailer ? (
          <Trailer
            videoId={movieData.videos.results[0].key || false}
            callback={() => setTrailer(false)}
            newNotification={newNotification}
          />
        ) : null}
        <div className={hero.center}>
          <div className="container">
            <div className={styles.overview}>
              <div className={styles.overview__logo}>
                {movieData && movieData.logo ? (
                  <LazyLoadImage
                    src={logo}
                    alt={movieData.title}
                    effect="opacity"
                    visibleByDefault={true}
                  />
                ) : (
                  <p className={`${typo.title} ${typo.bold}`}>
                    {movieData ? movieData.title : ''}
                  </p>
                )}
              </div>
              <div className={styles.overview__wrap}>
                {movieData ? (
                  <div className={styles.overview__info}>
                    <p className={`${typo.body} ${typo.bold}`}>
                      {movieData && movieData.release_date
                        ? new Date(movieData.release_date).getFullYear()
                        : 'Coming Soon'}
                      <span className={typo.vertical_spacer}></span>
                      {movieData && movieData.runtime
                        ? timeConvert(movieData.runtime)
                        : 'Unknown'}
                      <span className={typo.vertical_spacer}></span>
                      {movieData && movieData.original_language
                        ? formatLang(movieData.original_language)
                        : 'Unknown Language'}
                      {movieData && movieData.age_rating ? (
                        <span className={typo.vertical_spacer}></span>
                      ) : null}
                      {movieData && movieData.age_rating
                        ? movieData.age_rating
                        : ''}
                    </p>
                    {movieData ? <Critics data={movieData} /> : null}
                  </div>
                ) : null}
                {movieData &&
                movieData.genres &&
                movieData.genres.length > 0 ? (
                  <p
                    className={`${typo.xsmall} ${typo.uppercase} ${styles.overview__genres}`}
                  >
                    {movieData.genres.map((genre) => {
                      const match = matchGenre('movie', genre.id);
                      if (!match) return null;
                      return (
                        <span key={`movie_genre_${genre.id}`}>
                          <Link to={`/movie/genre/${genre.id}`}>
                            {match.name}
                          </Link>
                        </span>
                      );
                    })}
                    {movieData.keywords.length > 0
                      ? movieData.keywords.map((genre) => {
                          const match = matchGenre('movie', genre.id);
                          if (!match) return null;
                          return (
                            <span key={`movie_genre_${genre.id}`}>
                              <Link to={`/movie/genre/${genre.id}`}>
                                {match.name}
                              </Link>
                            </span>
                          );
                        })
                      : null}
                  </p>
                ) : null}
                {movieData ? (
                  <p
                    className={`${typo.body} ${typo.medium} ${styles.overview__content}`}
                  >
                    {movieData.tagline} {movieData.overview}
                  </p>
                ) : null}
                {movieData ? (
                  <div className={styles.actions}>
                    <div className={styles.actions__request}>
                      <RequestButton
                        data={movieData}
                        globalRequests={redux_requests}
                        currentUser={currentUser}
                        updateRequests={updateRequests}
                        newNotification={newNotification}
                        classStyle={styles.actions__request__main_btn}
                      />
                    </div>
                    <ReviewButtons
                      redux_reviews={redux_reviews}
                      currentUser={currentUser}
                      styles={styles}
                      data={movieData}
                      newNotification={newNotification}
                    />
                    <button
                      className={`${buttons.icon} ${styles.actions__btn}`}
                      onClick={() => {
                        setIssuesOpen(true);
                      }}
                    >
                      <IssueIcon viewBox="0 0 24 24" />
                    </button>
                    <button
                      className={`${buttons.icon} ${styles.actions__btn} ${
                        movieData &&
                        movieData.videos &&
                        movieData.videos.results &&
                        movieData.videos.results.length > 0
                          ? ''
                          : styles.actions__btn__disabled
                      }`}
                      onClick={() => setTrailer(true)}
                    >
                      <TrailerIcon />
                    </button>
                    <button
                      className={`${buttons.icon} ${styles.actions__btn} ${styles.actions__btn__disabled}`}
                    >
                      <WatchlistIcon />
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
        <div className={hero.single__background}>
          {movieData ? (
            <Hero
              className={hero.single__image}
              image={movieData.backdrop_path}
            />
          ) : null}
        </div>
        {!mobile ? (
          <div className="container">
            <div className={styles.overview__credits}>{renderCredits()}</div>
          </div>
        ) : null}
      </div>
      <div className={styles.content}>
        <div className="container">
          {movieData ? (
            <div className={styles.details}>
              <p className={typo.carousel_title}>Movie Details</p>
              <div className={styles.details__content}>
                <div className={styles.details__content__inner}>
                  {mobile ? renderCredits() : null}
                  {movieData.release_date ? (
                    <div className={styles.details__content__item}>
                      <p
                        className={`${typo.body} ${typo.bold} ${styles.details__content__item__title}`}
                      >
                        Release Date
                      </p>
                      <p className={typo.body}>
                        {new Date(movieData.release_date).toLocaleDateString(
                          'en-US',
                          {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          },
                        )}
                      </p>
                    </div>
                  ) : null}
                  {movieData.spoken_languages &&
                  movieData.spoken_languages.length > 0 ? (
                    <div className={styles.details__content__item}>
                      <p
                        className={`${typo.body} ${typo.bold} ${styles.details__content__item__title}`}
                      >
                        Languages
                      </p>
                      <p className={typo.body}>
                        {movieData.spoken_languages.map((lang, i) => {
                          let out = '';
                          if (i !== 0) out += ', ';
                          out += lang.name;
                          return out;
                        })}
                      </p>
                    </div>
                  ) : null}
                  {movieData.status ? (
                    <div className={styles.details__content__item}>
                      <p
                        className={`${typo.body} ${typo.bold} ${styles.details__content__item__title}`}
                      >
                        Status
                      </p>
                      <p className={typo.body}>{movieData.status}</p>
                    </div>
                  ) : null}
                  {movieData.budget ? (
                    <div className={styles.details__content__item}>
                      <p
                        className={`${typo.body} ${typo.bold} ${styles.details__content__item__title}`}
                      >
                        Budget
                      </p>
                      <p className={typo.body}>
                        ${new Intl.NumberFormat().format(movieData.budget)}
                      </p>
                    </div>
                  ) : null}
                  {movieData.revenue ? (
                    <div className={styles.details__content__item}>
                      <p
                        className={`${typo.body} ${typo.bold} ${styles.details__content__item__title}`}
                      >
                        Revenue
                      </p>
                      <p className={typo.body}>
                        ${new Intl.NumberFormat().format(movieData.revenue)}
                      </p>
                    </div>
                  ) : null}
                  {movieData.production_companies &&
                  movieData.production_companies.length > 0 ? (
                    <div className={styles.details__content__item}>
                      <p
                        className={`${typo.body} ${typo.bold} ${styles.details__content__item__title}`}
                      >
                        Studios
                      </p>
                      <p className={typo.body}>
                        {movieData.production_companies.map((studio, i) => {
                          let out = '';
                          if (i !== 0) out += ', ';
                          out += studio.name;
                          return (
                            <Link
                              to={`/movie/studio/${studio.id}`}
                              key={`movie_detail_studio_${studio.id}`}
                            >
                              {out}
                            </Link>
                          );
                        })}
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}
        </div>
        {movieData &&
        movieData.credits &&
        movieData.credits.cast &&
        movieData.credits.cast.length > 0 ? (
          <Carousel
            title="Top Billed Cast"
            data={movieData.credits.cast}
            type="people"
            key={`${movieData.id}_cast`}
            id={`${movieData.id}_cast`}
          />
        ) : null}
        {movieData &&
        movieData.belongs_to_collection &&
        collection &&
        collection.length > 0 ? (
          <Carousel
            title={movieData.belongs_to_collection.name}
            data={collection}
            type="movie"
            key={`${movieData.id}_collection`}
            id={`${movieData.id}_collection`}
            newNotification={newNotification}
          />
        ) : null}
        {movieData && movieData.recommendations ? (
          <Carousel
            title="Related Movies"
            data={movieData.recommendations}
            type="movie"
            key={`${movieData.id}_related`}
            id={`${movieData.id}_related`}
            newNotification={newNotification}
          />
        ) : null}
      </div>
    </div>
  );
}

export default connect(mapStateToProps)(Movie);
