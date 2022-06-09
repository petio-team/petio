import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/opacity.css';
import { Link } from 'react-router-dom';

import { ReactComponent as Spinner } from '../assets/svg/spinner.svg';
import { ReactComponent as ThumbDown } from '../assets/svg/thumb-down.svg';
import { ReactComponent as ThumbUp } from '../assets/svg/thumb-up.svg';
import { getReviews, saveReview } from '../services/user.service';
import buttons from '../styles/components/button.module.scss';
import typo from '../styles/components/typography.module.scss';
import styles from '../styles/views/myAccount.module.scss';

export default function ReviewQueue({
  history,
  redux_reviews,
  currentUser,
  newNotification,
}) {
  function isReviewed(data) {
    if (!data.id) return false;
    if (redux_reviews && redux_reviews.length > 0 && currentUser) {
      const review = redux_reviews.filter((r) => {
        return (
          parseInt(r.tmdb_id) === parseInt(data.id) && r.user === currentUser.id
        );
      });
      if (review && review[0] && review[0].score) return review[0].score;
      return false;
    }
  }

  async function review(type, data) {
    if (!type) return;
    try {
      await saveReview(data, currentUser.id, type === 'good' ? 10 : 1);
      await getReviews();
    } catch (e) {
      console.log(e);
      newNotification({
        message: 'Failed to save review',
        type: 'error',
      });
    }
  }

  return (
    <div className={styles.reviewQueue}>
      {!history ? (
        [...Array(6)].map((e, i) => {
          return (
            <div
              key={`reviewq__placeholder__${i}`}
              className={styles.reviewQueue__item}
            >
              <div className={styles.reviewQueue__item__inner}>
                <div className={styles.reviewQueue__item__image}>
                  <div className={styles.reviewQueue__loader}>
                    <Spinner />
                  </div>
                </div>
                <div className={styles.reviewQueue__item__content}>
                  <p className={`${typo.body} ${typo.medium}`}>&nbsp;</p>
                  <div className={styles.reviewQueue__item__btns}>
                    <button
                      className={`${buttons.icon} ${styles.actions__btn}`}
                      style={{ pointerEvents: 'none' }}
                    >
                      <ThumbUp viewBox="0 0 24 24" />
                    </button>
                    <button
                      className={`${buttons.icon} ${styles.actions__btn}`}
                      style={{ pointerEvents: 'none' }}
                    >
                      <ThumbDown viewBox="0 0 24 24" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })
      ) : Object.keys(history).length > 0 ? (
        Object.keys(history).map((i) => {
          const item = history[i];
          const reviewed = isReviewed(item);
          const type = item.episode_run_time ? 'tv' : 'movie';
          console.log(reviewed);
          if (!item.id) return null;
          return (
            <div
              key={`reviewq__${item.id}`}
              className={styles.reviewQueue__item}
            >
              <Link to={`${item ? `/${type}/${item.id}` : '#'}`}></Link>
              <div className={styles.reviewQueue__item__inner}>
                <div className={styles.reviewQueue__item__image}>
                  {item.backdrop_path ? (
                    <>
                      <LazyLoadImage
                        className={styles.reviewQueue__item__image__img}
                        src={`https://image.tmdb.org/t/p/w780${item.backdrop_path}`}
                        effect="opacity"
                      />
                      {item.logo ? (
                        <div className={styles.reviewQueue__item__logo}>
                          <LazyLoadImage
                            className={styles.reviewQueue__item__logo__img}
                            src={item.logo}
                            effect="opacity"
                          />
                        </div>
                      ) : (
                        <p
                          className={`${styles.reviewQueue__item__logo__text} ${typo.smtitle} ${typo.medium} ${styles.no_logo}`}
                        >
                          {item.title || item.name}
                        </p>
                      )}
                    </>
                  ) : (
                    <p
                      className={`${typo.smtitle} ${typo.medium} ${styles.reviewQueue__item__noLogo}`}
                    >
                      {item.title || item.name}
                    </p>
                  )}
                </div>
                <div className={styles.reviewQueue__item__content}>
                  <p
                    className={`${typo.body} ${typo.medium}`}
                    style={{
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {item.title || item.name}
                    {item.first_air_date
                      ? ` (${new Date(item.first_air_date).getFullYear()})`
                      : item.release_date
                      ? ` ${new Date(item.release_date).getFullYear()})`
                      : ''}
                  </p>
                  <div className={styles.reviewQueue__item__btns}>
                    <button
                      className={`${buttons.icon} ${styles.actions__btn} ${
                        reviewed === 10 ? styles.actions__btn__up : ''
                      }`}
                      onClick={() => review('good', item)}
                    >
                      <ThumbUp viewBox="0 0 24 24" />
                    </button>
                    <button
                      className={`${buttons.icon} ${styles.actions__btn} ${
                        reviewed === 1 ? styles.actions__btn__down : ''
                      }`}
                      onClick={() => review('bad', item)}
                    >
                      <ThumbDown viewBox="0 0 24 24" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <p
          className={`${styles.reviewQueue__empty} ${typo.smtitle} ${typo.medium}`}
        >
          Your queue is empty
        </p>
      )}
    </div>
  );
}
