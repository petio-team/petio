import { ReactComponent as ImdbIcon } from '../assets/svg/imdb.svg';
import styles from '../styles/components/critics.module.scss';
import typo from '../styles/components/typography.module.scss';

export default function Critics({ data }) {
  return (
    <div className={styles.critics}>
      {data.imdb_data &&
      data.imdb_data.rating &&
      data.imdb_data.rating.ratingValue ? (
        <>
          <div className={styles.critics__item}>
            <ImdbIcon viewBox="0 0 64 32" />
            <p className={`${typo.body} ${typo.bold}`}>
              {data.imdb_data.rating.ratingValue}
            </p>
          </div>
        </>
      ) : null}
      {data.vote_average ? (
        <>
          <div className={styles.critics__item}>
            <svg viewBox="0 0 36 36" className="score">
              <path
                className="score-bg"
                d="M18 2.0845
          a 15.9155 15.9155 0 0 1 0 31.831
          a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="score-value"
                strokeDasharray={`${Math.ceil(data.vote_average * 10)}, 100`}
                d="M18 2.0845
          a 15.9155 15.9155 0 0 1 0 31.831
          a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <p className={`${typo.body} ${typo.bold}`}>
              {Math.ceil(data.vote_average * 10)}%
            </p>
          </div>
        </>
      ) : null}
    </div>
  );
}
