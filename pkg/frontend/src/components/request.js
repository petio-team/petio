import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/opacity.css';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import { ReactComponent as CheckIcon } from '../assets/svg/check.svg';
import typo from '../styles/components/typography.module.scss';
import styles from '../styles/views/requests.module.scss';

const mapStateToProps = (state) => {
  return {
    redux_movies: state.media.movies,
    redux_tv: state.media.tv,
  };
};

function Request({ redux_movies, redux_tv, request }) {
  let requestData = false;
  if (request)
    requestData =
      request.type === 'movie'
        ? redux_movies[request.requestId]
        : redux_tv[request.requestId];
  const processStage =
    request && request.process_stage ? request.process_stage : false;
  return (
    <div className={styles.item}>
      <div className={styles.item__wrap}>
        <Link
          to={`${request ? `/${request.type}/${request.requestId}` : '#'}`}
          className={styles.card}
        >
          <div className={styles.card__image}>
            {!requestData ? null : requestData.backdrop_path ? (
              <>
                <LazyLoadImage
                  className={styles.card__image__img}
                  src={`https://image.tmdb.org/t/p/w780${requestData.backdrop_path}`}
                  effect="opacity"
                />
                {requestData.logo ? (
                  <div className={styles.card__logo}>
                    <LazyLoadImage
                      className={styles.card__logo__img}
                      src={requestData.logo}
                      effect="opacity"
                    />
                  </div>
                ) : (
                  <p
                    className={`${styles.card__logo__text} ${typo.smtitle} ${typo.medium} ${styles.no_logo}`}
                  >
                    {requestData.title || requestData.name}
                  </p>
                )}
              </>
            ) : (
              <p className={`${typo.smtitle} ${typo.medium} ${styles.no_logo}`}>
                {requestData.title || requestData.name}
              </p>
            )}
          </div>
        </Link>
        <div className={styles.item__content}>
          {requestData ? (
            <>
              <p
                className={`${styles.item__content__title} ${typo.bold} ${typo.body}`}
              >
                {requestData.title || requestData.name}
                <span className={styles.item__content__year}>
                  (
                  {request.type === 'movie'
                    ? requestData.release_date
                      ? new Date(requestData.release_date).getFullYear()
                      : 'Coming Soon'
                    : requestData.first_air_date
                    ? new Date(requestData.first_air_date).getFullYear() +
                      ' - ' +
                      (requestData.status !== 'Ended'
                        ? ''
                        : new Date(requestData.last_air_date).getFullYear())
                    : 'Coming Soon'}
                  )
                </span>
              </p>
              <p className={typo.small}>
                <b>Status:</b> {processStage.message}
              </p>
              <p className={typo.small} style={{ textTransform: 'capitalize' }}>
                <b>Type:</b> {request.type}
              </p>
              <div className={styles.steps}>
                <div
                  className={`${styles.steps__step} ${
                    processStage.step > 1
                      ? styles.steps__step__complete
                      : processStage.step === 1
                      ? styles.steps__step__active
                      : ''
                  }`}
                >
                  <span className={styles.steps__step__icon}>
                    <CheckIcon />
                  </span>
                  <p className={typo.body}>Requested</p>
                </div>
                <div
                  className={`${styles.steps__step} ${
                    processStage.step > 2
                      ? styles.steps__step__complete
                      : processStage.step === 2
                      ? styles.steps__step__active
                      : ''
                  }`}
                >
                  <span className={styles.steps__step__icon}>
                    <CheckIcon />
                  </span>
                  <p className={typo.body}>Approved</p>
                </div>
                <div
                  className={`${styles.steps__step} ${
                    processStage.step > 3
                      ? styles.steps__step__complete
                      : processStage.step === 3
                      ? styles.steps__step__active
                      : ''
                  }`}
                >
                  <span className={styles.steps__step__icon}>
                    <CheckIcon />
                  </span>
                  <p className={typo.body}>Processing</p>
                </div>
                <div
                  className={`${styles.steps__step} ${
                    processStage.step > 4
                      ? styles.steps__step__complete
                      : processStage.step === 4
                      ? styles.steps__step__active
                      : ''
                  }`}
                >
                  <span className={styles.steps__step__icon}>
                    <CheckIcon />
                  </span>
                  <p className={typo.body}>Finalising</p>
                </div>
                <div className={styles.steps__step}>
                  <span className={styles.steps__step__icon}>
                    <CheckIcon />
                  </span>
                  <p className={typo.body}>Ready to watch</p>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default connect(mapStateToProps)(Request);
