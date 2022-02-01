import { useEffect, useState } from "react";
import { connect } from "react-redux";
import { getPlexMedia } from "../../services/plex.service";
import media from "../../services/media.service";
import styles from "../../styles/views/admin.module.scss";
import typo from "../../styles/components/typography.module.scss";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/opacity.css";
import { ReactComponent as PlayIcon } from "../../assets/svg/play.svg";
import { ReactComponent as PauseIcon } from "../../assets/svg/pause.svg";
import { ReactComponent as BufferIcon } from "../../assets/svg/buffer.svg";

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

  const reduxMovie = redux_movies[id];
  const reduxShow = redux_tv[id];

  useEffect(() => {
    async function getDetails() {
      try {
        if (!id) return;
        if (type === "movie") {
          if (reduxMovie) return;
          await media.getMovie(id, false, true);
          return;
        }
        if (type === "tv") {
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
    if (type === "movie") redux = redux_movies;
    if (type === "tv") redux = redux_tv;

    if (!redux || !id || !redux[id]) return null;

    setMeta(redux[id]);
  }, [redux_movies, redux_tv, id]);

  function pad(num, places = 2) {
    var zero = places - num.toString().length + 1;
    return Array(+(zero > 0 && zero)).join("0") + num;
  }

  function formatDecision(dec) {
    switch (dec) {
      case "copy":
        return "Direct Stream";

      case "transcode":
        return "Transcode";

      default:
        return "Direct Play";
    }
  }

  function status() {
    let playbackState;
    switch (session.Player.state) {
      case "playing":
      case "streaming":
        playbackState = (
          <>
            <PlayIcon /> <p className={typo.small}>Playing</p>
          </>
        );
        break;
      case "paused":
        playbackState = (
          <>
            <PauseIcon /> <p className={typo.small}>Paused</p>
          </>
        );
        break;
      case "buffering":
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

  let redux = false;

  const progressWidth = `${Math.ceil(progress)}%`;

  return (
    <div className={styles.session}>
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
          {type === "movie" ? meta.title : meta.name}
          {session.live ? " (Live)" : ""}
        </p>
        {session.type === "episode" ? (
          <p
            className={`${typo.small} ${styles.session__card__content__episode}`}
          >
            S{pad(session.parentIndex)} - E{pad(session.index)}
            {session.title ? ` - ${session.title}` : ""}
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
          {formatDecision(playback)} - {selectedMedia.videoResolution} (
          {bitrate})
        </p>
      </div>
      <div className={styles.session__card__user}>
        <p className={`${typo.small}`}>{session.User.title}</p>
      </div>
    </div>
  );
}

export default connect(mapStateToProps)(ActivitySession);
