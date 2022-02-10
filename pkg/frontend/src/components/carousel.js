import carousel from "../styles/components/carousel.module.scss";
import typo from "../styles/components/typography.module.scss";
import cards from "../styles/components/card.module.scss";

import { connect } from "react-redux";
import { Link, useHistory } from "react-router-dom";
// import { useRouter } from 'next/router';

import Card from "./card";
import { useEffect, useRef, useLayoutEffect, useState } from "react";
import { storePosition } from "../services/position.service";
import { ReactComponent as Chevron } from "../assets/svg/chevron.svg";

const mapStateToProps = (state) => {
  return {
    redux_pos: state.pos.pages,
  };
};

function Carousel({ data, title, type = "movie", id, redux_pos, link }) {
  const [waitForScroll, setWaitForScroll] = useState(true);
  const [end, setEnd] = useState(false);
  const [start, setStart] = useState(false);
  const placeholderRow = [];
  const rowId = id;
  // const router = useRouter();
  const track = useRef(null);
  const history = useHistory();

  for (let i = 0; i < 10; i++) {
    placeholderRow.push(
      <div className={cards.wrap} key={`${rowId}_${i}`}>
        <div
          className={
            type === "company" || type === "request"
              ? cards.placeholder__wide
              : cards.placeholder
          }
        ></div>
      </div>
    );
  }

  useLayoutEffect(() => {
    if (!track || !track.current || !data || data.length === 0) return;
    const el = track.current;
    updateControls();
    let bounce = false;
    function checkScroll() {
      clearTimeout(bounce);
      updateControls();
      bounce = setTimeout(() => {
        storePosition(history.location.pathname, false, {
          [id]: { scroll: el.scrollLeft },
        });
      }, 500);
    }

    function updateControls() {
      if (
        track.current.scrollLeft + track.current.offsetWidth >=
        track.current.scrollWidth
      ) {
        setEnd(true);
      } else {
        setEnd(false);
      }
      if (track.current.scrollLeft < 1) {
        setStart(true);
      } else {
        setStart(false);
      }
    }

    el.addEventListener("scroll", checkScroll);

    return () => {
      el.removeEventListener("scroll", checkScroll);
    };
  }, [history, track, id, data]);

  useEffect(() => {
    if (
      !track ||
      !track.current ||
      !data ||
      data.length === 0 ||
      !waitForScroll
    )
      return;
    const current = history.location.pathname;
    const reduxPage = redux_pos[current];
    if (reduxPage) {
      const carousels = reduxPage.carousels;
      if (!carousels) return;
      const thisCarousel = carousels[id];
      if (thisCarousel) {
        track.current.scrollLeft = thisCarousel.scroll;
      }
    }
    setWaitForScroll(false);
  }, [history.location.pathname, track, data, id, redux_pos, waitForScroll]);

  function scrollBack() {
    if (!track || !track.current || !data || data.length === 0) return;
    track.current.scroll({
      top: 0,
      left: track.current.scrollLeft - track.current.offsetWidth * 0.8,
      behavior: "smooth",
    });
  }

  function scrollForward() {
    if (!track || !track.current || !data || data.length === 0) return;
    track.current.scroll({
      top: 0,
      left: track.current.scrollLeft + track.current.offsetWidth * 0.8,
      behavior: "smooth",
    });
  }

  return (
    <div className="container">
      <div
        className={`${carousel.wrap} ${
          type === "request" ? carousel.wrap__nospacing : ""
        }`}
      >
        {link ? (
          <p className={typo.carousel_title}>
            {title ? (
              <Link to={link}>
                {title}
                <span className={typo.carousel_title__icon}></span>
              </Link>
            ) : (
              "Loading..."
            )}
          </p>
        ) : (
          <p className={typo.carousel_title}>{title ? title : "Loading..."}</p>
        )}
        <div className={carousel.controls}>
          <div
            className={`${carousel.controls__prev} ${
              start ? carousel.controls__disabled : ""
            }`}
            onClick={scrollBack}
          >
            <Chevron />
          </div>
          <div
            className={`${carousel.controls__next} ${
              end ? carousel.controls__disabled : ""
            }`}
            onClick={scrollForward}
          >
            <Chevron />
          </div>
        </div>
        <div
          className={`${carousel.track} ${
            type === "request" ? carousel.track__nospacing : ""
          } carousel-store`}
          id={rowId}
          ref={track}
        >
          {data && data.length > 0
            ? data.map((item, i) => {
                if (item === "watched") return null;

                if (type === "request") {
                  return (
                    <Card
                      key={`${rowId}__carousel__${item.id}__${i}`}
                      title={item.title}
                      poster={item.poster}
                      logo={item.logo}
                      video={false}
                      type={type}
                      id={item.id}
                      requestType={item.requestType}
                    />
                  );
                }
                const video =
                  item.videos && item.videos.results.length > 0
                    ? item.videos.results[0].key
                    : false;
                const date =
                  type === "movie"
                    ? item.release_date
                    : type === "tv"
                    ? item.first_air_date
                    : "";
                const poster =
                  type === "movie" || type === "tv"
                    ? item.poster_path
                    : type === "people"
                    ? item.profile_path
                    : item.logo_path;
                if (typeof item === "string" || typeof item === "number")
                  item = { id: item, load: true };

                return (
                  <Card
                    key={`${rowId}__carousel__${item.id}__${i}`}
                    title={type === "movie" ? item.title : item.name}
                    poster={poster}
                    video={video}
                    year={date ? new Date(date).getFullYear() : false}
                    type={type}
                    id={item.id}
                    character={item.character}
                    credit={item.credit}
                    name={item.name}
                    item={item}
                    load={item.load}
                  />
                );
              })
            : placeholderRow}
        </div>
      </div>
    </div>
  );
}

export default connect(mapStateToProps)(Carousel);
