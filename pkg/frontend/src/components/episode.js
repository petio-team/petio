import { LazyLoadImage } from 'react-lazy-load-image-component';

import { ReactComponent as Tick } from '../assets/svg/check.svg';
import typo from '../styles/components/typography.module.scss';
import styles from '../styles/views/tv.module.scss';

export default function Episode({
  data,
  episode,
  expand,
  i,
  limit,
  currentSeasonData,
  globalRequests,
  mobile,
}) {
  if (i > limit && !expand) return null;

  const requested = globalRequests && globalRequests[data.id] ? true : false;

  let airDate = episode.air_date ? Date.parse(episode.air_date) : false;

  let onServer = false;

  if (data.on_server && data.on_server.versions)
    data.on_server.versions.forEach((version) => {
      if (
        !onServer &&
        version.seasons[currentSeasonData.season_number] &&
        version.seasons[currentSeasonData.season_number].episodes &&
        version.seasons[currentSeasonData.season_number].episodes[
          episode.episode_number
        ]
      )
        onServer = true;
    });

  return (
    <div className={styles.episode}>
      <div className={styles.episode__image}>
        <div className={styles.episode__image__status}>
          {onServer ? (
            <div
              className={`
								${styles.episode__image__status__item} ${styles.episode__image__status__on_server}`}
            >
              <Tick />
            </div>
          ) : null}
          {requested ? (
            <div
              className={`
								${styles.episode__image__status__item} ${styles.episode__image__status__requested}`}
            >
              <Tick />
            </div>
          ) : null}
        </div>
        {episode.still_path ? (
          <LazyLoadImage
            src={`https://image.tmdb.org/t/p/w500${episode.still_path}`}
            alt={episode.name}
            // effect="opacity"
          />
        ) : data.backdrop_path ? (
          <LazyLoadImage
            src={`https://image.tmdb.org/t/p/w500${data.backdrop_path}`}
            alt={episode.name}
            // effect="opacity"
          />
        ) : (
          <div className={styles.episode__image__placeholder}>
            <p className={`${typo.smtitle} ${typo.medium} ${styles.no_poster}`}>
              {episode.name}
            </p>
          </div>
        )}
      </div>
      <div className={styles.episode__top}>
        <p
          className={`${styles.episode__top__number} ${typo.small} ${typo.uppercase} ${typo.medium} ${styles.episode__number}`}
        >
          Episode {episode.episode_number}
        </p>
        <p
          className={`${styles.episode__airdate} ${typo.small} ${typo.medium} ${typo.uppercase}`}
        >
          {daysTillAir(airDate)}
        </p>
      </div>
      <p className={`${typo.small} ${typo.bold} ${styles.episode__name}`}>
        {episode.name}
      </p>
      {mobile ? null : (
        <p className={`${typo.small} ${styles.episode__overview}`}>
          {episode.overview.length > 160
            ? episode.overview.substring(0, 157) + '...'
            : episode.overview}
        </p>
      )}
    </div>
  );
}

function daysTillAir(airDate) {
  if (!airDate) return <span className="not-aired">Unknown</span>;
  var oneDay = 24 * 60 * 60 * 1000;
  var secondDate = new Date();
  var firstDate = new Date(airDate);
  let days = Math.round(
    Math.abs(
      (firstDate.setHours(0, 0, 0, 0) - secondDate.setHours(0, 0, 0, 0)) /
        oneDay,
    ),
  );

  if (firstDate < secondDate) {
    return <span className={styles.episode__info__aired}>Aired</span>;
  }

  if (days === 0) {
    return <span className={styles.episode__info__airsToday}>Airs today</span>;
  }

  return days < 100 ? (
    <span className={styles.episode__info__notAired}>
      Airs in {days} {days > 1 ? 'days' : 'day'}
    </span>
  ) : (
    <span className={styles.episode__info__notAired}>Not aired</span>
  );
}
