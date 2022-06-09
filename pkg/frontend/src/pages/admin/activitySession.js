import { useEffect, useState } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/opacity.css';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import { ReactComponent as BufferIcon } from '../../assets/svg/buffer.svg';
import { ReactComponent as PauseIcon } from '../../assets/svg/pause.svg';
import { ReactComponent as PlayIcon } from '../../assets/svg/play.svg';
import media from '../../services/media.service';
import { getPlexMedia } from '../../services/plex.service';
import typo from '../../styles/components/typography.module.scss';
import styles from '../../styles/views/admin.module.scss';

const mapStateToProps = (state) => {
  return {
    redux_movies: state.media.movies,
    redux_tv: state.media.tv,
  };
};

function ActivitySession({
  ratingKey,
  type,
  redux_movies,
  redux_tv,
  session,
  progress,
  playback,
  selectedMedia,
  bitrate,
}) {
  const [id, setId] = useState(false);
  const [meta, setMeta] = useState(false);
  const [reduxShow, setReduxShow] = useState(false);
  const [reduxMovie, setReduxMovie] = useState(false);

  useEffect(() => {
    if (!id) return;
    setReduxShow(redux_tv[id]);
    setReduxMovie(redux_movies[id]);
  }, [id, redux_movies, redux_tv]);

  useEffect(() => {
    if (!ratingKey) return;
    async function getDetails() {
      try {
        const lookup = await getPlexMedia(ratingKey, type);
        setId(lookup.tmdb_id);
      } catch (e) {
        console.log(e);
      }
    }

    getDetails();
  }, [ratingKey, type]);

  useEffect(() => {
    async function getDetails() {
      try {
        if (!id) return;
        if (type === 'movie') {
          if (reduxMovie) return;

          await media.getMovie(id, false, true);
          return;
        }
        if (type === 'tv') {
          if (reduxShow) return;
          await media.getTv(id, false, true);
          return;
        }
      } catch (e) {
        console.log(e);
      }
    }

    getDetails();
  }, [id, reduxMovie, reduxShow, type]);

  useEffect(() => {
    let redux = false;
    if (type === 'movie') redux = redux_movies;
    if (type === 'tv') redux = redux_tv;

    if (!redux || !id || !redux[id]) return null;

    setMeta(redux[id]);
  }, [redux_movies, redux_tv, id, type]);

  function pad(num, places = 2) {
    var zero = places - num.toString().length + 1;
    return Array(+(zero > 0 && zero)).join('0') + num;
  }

  function formatDecision(dec) {
    switch (dec) {
      case 'copy':
        return 'Direct Stream';

      case 'transcode':
        return 'Transcode';

      default:
        return 'Direct Play';
    }
  }

  function formatRes(res) {
    switch (res) {
      case '1080':
      case '1080p':
      case '1080P':
        return 'HD 1080p';
      case '720':
      case '720p':
      case '720P':
        return 'HD 720p';
      case 'sd':
      case '480':
      case '576':
      case '480p':
      case '576p':
        return 'SD';
      case '2160':
      case '4k':
      case '4K':
        return 'UHD 4K';
      default:
        return res;
    }
  }

  function status() {
    let playbackState;
    switch (session.Player.state) {
      case 'playing':
      case 'streaming':
        playbackState = (
          <>
            <PlayIcon /> <p className={typo.small}>Playing</p>
          </>
        );
        break;
      case 'paused':
        playbackState = (
          <>
            <PauseIcon /> <p className={typo.small}>Paused</p>
          </>
        );
        break;
      case 'buffering':
        playbackState = (
          <>
            <BufferIcon /> <p className={typo.small}>Buffering</p>
          </>
        );
        break;
      default:
        playbackState = <p className={typo.small}>{session.Player.state}</p>;
        break;
    }
    return playbackState;
  }

  const progressWidth = `${Math.ceil(progress)}%`;

  if (type === 'music') {
    return (
      <div className={styles.session}>
        <div className={styles.session__card}>
          <div className={styles.session__card__status}>{status()}</div>
          <div className={styles.session__card__spacer}></div>
          <p
            className={`${styles.session__card__logo__text} ${typo.smtitle} ${typo.medium} ${styles.no_logo}`}
          >
            Audio
          </p>
          <div className={styles.session__card__progress__wrap}>
            <div
              className={styles.session__card__progress}
              style={{ width: progressWidth }}
            ></div>
          </div>
        </div>
        <div className={styles.session__card__content}>
          <p
            className={`${typo.medium} ${typo.body} ${styles.session__card__content__title}`}
          >
            {session.title}
          </p>

          <p
            className={`${typo.small} ${styles.session__card__content__episode}`}
          >
            {session.grandparentTitle}
          </p>
        </div>
        <div className={styles.session__card__detail}>
          <p className={`${typo.small}`}>{formatDecision(playback)}</p>
        </div>
        <div className={styles.session__card__user}>
          <p className={`${typo.small}`}>{session.User.title}</p>
        </div>
      </div>
    );
  }

  return (
    <Link to={`/${type}/${id}`} className={styles.session}>
      <div className={styles.session__card}>
        <div className={styles.session__card__status}>{status()}</div>
        <div className={styles.session__card__spacer}></div>
        {meta.backdrop_path ? (
          <LazyLoadImage
            className={styles.session__card__img}
            src={`https://image.tmdb.org/t/p/w780${meta.backdrop_path}`}
            effect="opacity"
          />
        ) : null}
        {meta.logo ? (
          <div className={styles.session__card__logo}>
            <LazyLoadImage
              className={styles.session__card__logo__img}
              src={meta.logo}
              effect="opacity"
            />
          </div>
        ) : (
          <p
            className={`${styles.session__card__logo__text} ${typo.smtitle} ${typo.medium} ${styles.no_logo}`}
          >
            {meta.title || meta.name}
          </p>
        )}
        <div className={styles.session__card__progress__wrap}>
          <div
            className={styles.session__card__progress}
            style={{ width: progressWidth }}
          ></div>
        </div>
      </div>
      <div className={styles.session__card__content}>
        <p
          className={`${typo.medium} ${typo.body} ${styles.session__card__content__title}`}
        >
          {type === 'movie' ? meta.title || ' ' : meta.name || ' '}
          {session.live ? ' (Live)' : ''}
        </p>
        {session.type === 'episode' ? (
          <p
            className={`${typo.small} ${styles.session__card__content__episode}`}
          >
            S{pad(session.parentIndex)} - E{pad(session.index)}
            {session.title ? ` - ${session.title}` : ''}
          </p>
        ) : (
          <p
            className={`${typo.small} ${styles.session__card__content__episode}`}
          >
            &nbsp;
          </p>
        )}
      </div>
      <div className={styles.session__card__detail}>
        <p className={`${typo.small}`}>
          {formatDecision(playback)} -{' '}
          {formatRes(selectedMedia.videoResolution)} ({bitrate})
        </p>
      </div>
      <div className={styles.session__card__user}>
        <p className={`${typo.small}`}>{session.User.title}</p>
      </div>
    </Link>
  );
}

export default connect(mapStateToProps)(ActivitySession);
