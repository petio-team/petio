import { useEffect, useState } from "react";
import { connect } from "react-redux";
import { getPlexMedia } from "../../services/plex.service";
import media from "../../services/media.service";
import styles from "../../styles/views/admin.module.scss";
import typo from "../../styles/components/typography.module.scss";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/opacity.css";

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
}) {
  const [id, setId] = useState(false);
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

  function pad(num, places = 2) {
    var zero = places - num.toString().length + 1;
    return Array(+(zero > 0 && zero)).join("0") + num;
  }

  let redux = false;

  if (type === "movie") redux = redux_movies;
  if (type === "tv") redux = redux_tv;

  if (!redux || !id || !redux[id]) return null;

  const meta = redux[id];
  const progressWidth = `${Math.ceil(progress)}%`;

  return (
    <div className={styles.session}>
      <div className={styles.session__card}>
        <div className={styles.session__card__spacer}></div>
        <LazyLoadImage
          className={styles.session__card__img}
          src={`https://image.tmdb.org/t/p/w780${meta.backdrop_path}`}
          effect="opacity"
        />
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
        <p className={`${typo.medium} ${typo.body}`}>
          {type === "movie" ? meta.title : meta.name}
          {session.live ? " (Live)" : ""}
        </p>
        {session.type === "episode" ? (
          <p className={`${typo.small}`}>
            s{pad(session.parentIndex)}e{pad(session.index)}
            {session.title ? ` - ${session.title}` : ""}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export default connect(mapStateToProps)(ActivitySession);
