import styles from "../styles/components/card.module.scss";
import typo from "../styles/components/typography.module.scss";

import ReactPlayer from "react-player/youtube";
import { useState, useEffect, useRef } from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/opacity.css";
import { Link } from "react-router-dom";
import { connect } from "react-redux";

import { ReactComponent as Tick } from "../assets/svg/check.svg";

const mapStateToProps = (state) => {
  return {
    redux_movies: state.media.movies,
    redux_tv: state.media.tv,
    redux_requests: state.user.requests,
  };
};

function Card({
  title,
  poster,
  video,
  year,
  type,
  requestType,
  id,
  character,
  credit,
  name,
  load = false,
  grid = false,
  redux_movies,
  redux_tv,
  redux_requests,
  logo = false,
}) {
  const [showTrailer, setShowTrailer] = useState(false);
  const [delayHandler, setDelayHandler] = useState(null);
  const [posterState, setPosterState] = useState(false);
  const [titleState, setTitle] = useState("");
  const [videoState, setVideo] = useState(false);
  const mountedRef = useRef(true);
  const [onServer, setOnServer] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [animate2, setAnimate2] = useState(false);

  const marqueeText = useRef(null);
  const marquee = useRef(null);
  const marqueeText2 = useRef(null);
  const marquee2 = useRef(null);

  const handleMouseEnter = (event) => {
    setDelayHandler(
      setTimeout(() => {
        if (!mountedRef.current) return null;
        setShowTrailer(true);
      }, 1000)
    );
  };

  const handleMouseLeave = () => {
    setShowTrailer(false);
    clearTimeout(delayHandler);
  };

  useEffect(() => {
    let redux = false;
    switch (type) {
      case "movie":
        redux = redux_movies[id];
        setTitle(redux ? redux.title : "");
        setPosterState(redux ? redux.poster_path : false);
        setOnServer(redux ? redux.on_server : false);
        if (redux) {
          const video =
            redux.videos && redux.videos.results.length > 0
              ? redux.videos.results[0].key
              : false;
          if (video) setVideo(video);
        }
        break;
      case "tv":
      case "show":
        redux = redux_tv[id];
        setTitle(redux ? redux.name : "");
        setPosterState(redux ? redux.poster_path : false);
        setOnServer(redux ? redux.on_server : false);
        if (redux) {
          const video =
            redux.videos && redux.videos.results.length > 0
              ? redux.videos.results[0].key
              : false;
          if (video) setVideo(video);
        }
        break;
      case "people":
        setTitle(title);
        setPosterState(poster ? poster : false);
        break;
      default:
        setTitle(false);
        setPosterState(false);
        setOnServer(false);
        break;
    }
  }, [id, redux_movies, redux_tv, poster, title, type]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (marqueeText && marqueeText.current && marquee && marquee.current) {
      if (marqueeText.current.offsetWidth > marquee.current.offsetWidth) {
        setAnimate(true);
      } else {
        setAnimate(false);
      }
    }
  }, [marqueeText, marquee]);

  useEffect(() => {
    if (marqueeText2 && marqueeText2.current && marquee2 && marquee2.current) {
      if (marqueeText2.current.offsetWidth > marquee2.current.offsetWidth) {
        setAnimate2(true);
      } else {
        setAnimate2(false);
      }
    }
  }, [marqueeText, marquee]);

  if (type === "company") {
    return (
      <Link to={`/movie/studio/${id}`} className={styles.wrap}>
        <div className={styles.wide}>
          {poster ? (
            <LazyLoadImage
              className={styles.logo}
              src={`https://image.tmdb.org/t/p/w500_filter(duotone,ff8300,cc6800)${poster}`}
              effect="opacity"
            />
          ) : (
            <p className={`${typo.smtitle} ${typo.medium} ${styles.no_logo}`}>
              {title}
            </p>
          )}
        </div>
      </Link>
    );
  }

  if (type === "network") {
    return (
      <Link to={`/tv/network/${id}`} className={styles.wrap}>
        <div className={styles.wide}>
          {poster ? (
            <LazyLoadImage
              className={styles.logo}
              src={`https://image.tmdb.org/t/p/w500_filter(duotone,ff8300,cc6800)${poster}`}
              effect="opacity"
            />
          ) : (
            <p className={`${typo.smtitle} ${typo.medium} ${styles.no_logo}`}>
              {title}
            </p>
          )}
        </div>
      </Link>
    );
  }

  if (type === "request") {
    return (
      <Link to={`/${requestType}/${id}`} className={styles.wrap}>
        <div className={styles.request}>
          {logo ? (
            <LazyLoadImage
              className={styles.request__logo}
              src={logo}
              effect="opacity"
            />
          ) : (
            <p
              className={`${typo.smtitle} ${typo.medium} ${styles.request__nologo}`}
            >
              {title}
            </p>
          )}
          {poster ? (
            <LazyLoadImage
              className={styles.request__image}
              src={`https://image.tmdb.org/t/p/w500${poster}`}
              alt={title}
            />
          ) : null}
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/${type}/${id}`}
      className={grid ? styles.grid__wrap : styles.wrap}
    >
      <div
        className={`${grid ? styles.grid : styles.default} ${
          type === "people" ? styles.cast : ""
        }`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className={styles.indicator__wrap}>
          {onServer ? (
            <div
              className={`
								${styles.indicator__item} ${styles.indicator__on_server}`}
            >
              <Tick />
            </div>
          ) : null}
          {redux_requests && redux_requests[id] ? (
            <div
              className={`
								${styles.indicator__item} ${styles.indicator__requested}`}
            >
              <Tick />
            </div>
          ) : null}
        </div>
        {posterState ? (
          <LazyLoadImage
            className={styles.image}
            src={`https://image.tmdb.org/t/p/w342${posterState}`}
            alt={titleState}
            // effect="opacity"
          />
        ) : (
          <p className={`${typo.smtitle} ${typo.medium} ${styles.no_poster}`}>
            {titleState}
          </p>
        )}
        {videoState && showTrailer ? (
          <ReactPlayer
            className={styles.video}
            url={`https://www.youtube.com/watch?v=${videoState}`}
            playing={true}
            width="100%"
            height="100%"
            playsinline={true}
            loop={true}
            muted={true}
          />
        ) : null}
        <div className={styles.hover_info}>
          <p className={type.body}>
            {titleState} {year ? `(${year})` : null}
          </p>
        </div>
      </div>
      {type === "people" ? (
        <>
          <div
            ref={marquee2}
            className={`${styles.marquee} ${
              animate2 ? styles.marquee__anim : ""
            }`}
          >
            <p
              ref={marqueeText2}
              className={`${typo.body} ${typo.uppercase} ${typo.bold}`}
            >
              {name}
            </p>
          </div>
          <div
            ref={marquee}
            className={`${styles.marquee} ${
              animate ? styles.marquee__anim : ""
            }`}
          >
            <p ref={marqueeText} className={`${typo.body} ${typo.uppercase}`}>
              {character}
            </p>
          </div>
        </>
      ) : null}
      {credit ? (
        <div
          ref={marquee}
          className={`${styles.marquee} ${animate ? styles.marquee__anim : ""}`}
        >
          <p ref={marqueeText} className={`${typo.body} ${typo.uppercase}`}>
            {credit}
          </p>
        </div>
      ) : null}
    </Link>
  );
}

export default connect(mapStateToProps)(Card);
