import media from "../../services/media.service";

import { useState, useEffect } from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/opacity.css";
import { Link, useParams } from "react-router-dom";
import { connect } from "react-redux";
import Meta from "../../components/meta";
import Hero from "../../components/hero";
import Carousel from "../../components/carousel";
import Critics from "../../components/critics";
import Episodes from "../../components/episodes";
import RequestButton from "../../components/requestButton";

import hero from "../../styles/components/hero.module.scss";
import styles from "../../styles/views/tv.module.scss";
import typo from "../../styles/components/typography.module.scss";
import buttons from "../../styles/components/button.module.scss";

import { ReactComponent as IssueIcon } from "../../assets/svg/issue.svg";
import { ReactComponent as TrailerIcon } from "../../assets/svg/trailer.svg";
import { ReactComponent as WatchlistIcon } from "../../assets/svg/watchlist.svg";
import NotFound from "../404";
import { matchGenre } from "../../helpers/genres";
import { Loading } from "../../components/loading";
import Trailer from "../../components/trailer";
import ReviewButtons from "../../components/reviewButtons";
import languages from "../../helpers/languages";

const mapStateToProps = (state) => {
  return {
    redux_tv: state.media.tv,
    redux_requests: state.user.requests,
    redux_reviews: state.user.reviews,
  };
};

function Tv({
  currentUser,
  updateRequests,
  newNotification,
  redux_requests,
  redux_tv,
  redux_reviews,
}) {
  const [mobile, setMobile] = useState(false);
  const [trailer, setTrailer] = useState(false);
  const { pid } = useParams();
  const tvData = redux_tv[pid];

  useEffect(() => {
    function handleResize() {
      setMobile(window.innerWidth < 992);
    }
    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    async function getTvDetails() {
      try {
        media.getTv(pid);
      } catch (e) {
        console.log(e);
      }
    }

    if (!pid) return;
    getTvDetails();
  }, [pid]);

  function timeConvert(n) {
    var num = n;
    var hours = num / 60;
    var rhours = Math.floor(hours);
    var minutes = (hours - rhours) * 60;
    var rminutes = ("0" + Math.round(minutes)).slice(-2);
    var hrs = rhours < 1 ? "" : rhours === 1 ? " h " : rhours > 1 ? " h " : "";
    return `${rhours >= 1 ? rhours : ""}${hrs}${rminutes} mins`;
  }

  function filterCrew() {
    let out = [];
    if (tvData && tvData.credits && tvData.credits.crew) {
      const crew = tvData.credits.crew;
      let createdBy = tvData.created_by;
      let directors = crew.filter((obj) => obj.job === "Director");
      let authors = crew.filter((obj) => obj.job === "Novel");
      let writers = crew.filter((obj) => obj.job === "Screenplay");
      let eProducers = crew.filter((obj) => obj.job === "Executive Producer");
      let producers = crew.filter((obj) => obj.job === "Producer");
      createdBy.forEach((creator) => {
        creator.job = "Created By";
      });
      let unsorted = [
        ...createdBy,
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
              roles: [item.job],
              id: item.id,
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
                    return ", " + role;
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
                  return ", " + role;
                }
                return role;
              })
            ) : null}
          </p>
        </div>
      );
    }
    return out;
  }

  function formatLang(code) {
    const match = languages.filter((l) => l.code === code);
    if (match && match[0]) {
      return match[0].name;
    } else {
      return "Unknown";
    }
  }

  if (tvData === "error") {
    return <NotFound />;
  }

  const credits = filterCrew();

  return (
    <div className={styles.wrap} key={`tv_single_${pid}`}>
      <Meta title={tvData ? tvData.name : ""} />
      {!tvData || !tvData.ready ? <Loading /> : null}
      <div className={hero.single}>
        {trailer ? (
          <Trailer
            videoId={tvData.videos.results[0].key || false}
            callback={() => setTrailer(false)}
            newNotification={newNotification}
          />
        ) : null}
        <div className={hero.center}>
          <div className="container">
            <div className={styles.overview}>
              <div className={styles.overview__logo}>
                {tvData && tvData.logo ? (
                  <LazyLoadImage
                    src={tvData.logo}
                    alt={tvData.name}
                    effect="opacity"
                    visibleByDefault={true}
                  />
                ) : (
                  <p className={`${typo.title} ${typo.bold}`}>
                    {tvData && tvData.name}
                  </p>
                )}
              </div>
              <div className={styles.overview__wrap}>
                {tvData ? (
                  <div className={styles.overview__info}>
                    <p className={`${typo.body} ${typo.bold}`}>
                      {tvData && tvData.first_air_date
                        ? new Date(tvData.first_air_date).getFullYear() +
                          " - " +
                          (tvData.status !== "Ended"
                            ? ""
                            : new Date(tvData.last_air_date).getFullYear())
                        : "Coming Soon"}
                      <span className={typo.vertical_spacer}></span>
                      {tvData &&
                      tvData.episode_run_time &&
                      tvData.episode_run_time.length > 0
                        ? timeConvert(tvData.episode_run_time[0])
                        : "Unknown"}
                      {!mobile ? (
                        <>
                          <span className={typo.vertical_spacer}></span>
                          {tvData &&
                            tvData.seasons &&
                            tvData.seasons.length}{" "}
                          Season
                          {tvData && tvData.seasons && tvData.seasons.length > 1
                            ? "s"
                            : ""}{" "}
                        </>
                      ) : null}
                      <span className={typo.vertical_spacer}></span>
                      {tvData && tvData.original_language
                        ? formatLang(tvData.original_language)
                        : "Unknown Language"}
                      {tvData && tvData.age_rating ? (
                        <span className={typo.vertical_spacer}></span>
                      ) : null}
                      {tvData && tvData.age_rating ? tvData.age_rating : ""}
                    </p>

                    {tvData ? <Critics data={tvData} /> : null}
                  </div>
                ) : null}
                {tvData && tvData.genres && tvData.genres.length > 0 ? (
                  <p
                    className={`${typo.small} ${typo.uppercase} ${styles.overview__genres}`}
                  >
                    {tvData.genres.map((genre) => {
                      const match = matchGenre("tv", genre.id);
                      if (!match) return null;
                      return (
                        <span key={`tv_genre_${genre.id}`}>
                          <Link to={`/tv/genre/${genre.id}`}>{match.name}</Link>
                        </span>
                      );
                    })}
                    {tvData.keywords.length > 0
                      ? tvData.keywords.map((genre) => {
                          const match = matchGenre("tv", genre.id);
                          if (!match) return null;
                          return (
                            <span key={`tv_genre_${genre.id}`}>
                              <Link to={`/tv/genre/${genre.id}`}>
                                {match.name}
                              </Link>
                            </span>
                          );
                        })
                      : null}
                  </p>
                ) : null}
                <p
                  className={`${typo.body} ${typo.medium} ${styles.overview__content}`}
                >
                  {tvData && tvData.tagline
                    ? `${tvData.tagline}${
                        !tvData.tagline.endsWith(".") ? "." : ""
                      }`
                    : null}{" "}
                  {tvData ? tvData.overview : null}
                </p>
                {tvData ? (
                  <div className={styles.actions}>
                    <div className={styles.actions__request}>
                      <RequestButton
                        data={tvData}
                        globalRequests={redux_requests}
                        currentUser={currentUser}
                        updateRequests={updateRequests}
                        type="tv"
                        newNotification={newNotification}
                        classStyle={styles.actions__request__main_btn}
                      />
                    </div>
                    <ReviewButtons
                      redux_reviews={redux_reviews}
                      currentUser={currentUser}
                      styles={styles}
                      data={tvData}
                      newNotification={newNotification}
                    />

                    <button
                      className={`${buttons.icon} ${styles.actions__btn}`}
                    >
                      <IssueIcon viewBox="0 0 24 24" />
                    </button>
                    <button
                      className={`${buttons.icon} ${styles.actions__btn} ${
                        tvData &&
                        tvData.videos &&
                        tvData.videos.results &&
                        tvData.videos.results.length > 0
                          ? ""
                          : styles.actions__btn__disabled
                      }`}
                      onClick={() => setTrailer(true)}
                    >
                      <TrailerIcon viewBox="0 0 24 24" />
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
          {tvData ? (
            <Hero className={hero.single__image} image={tvData.backdrop_path} />
          ) : null}
        </div>
        {!mobile ? (
          <div className="container">
            <div className={styles.overview__credits}>{renderCredits()}</div>
          </div>
        ) : null}
      </div>
      <div className="container">
        {tvData ? (
          <div className={styles.details}>
            <p className={typo.carousel_title}>Show Details</p>
            <div className={styles.details__content}>
              <div className={styles.details__content__inner}>
                {mobile ? renderCredits() : null}
                {tvData.first_air_date ? (
                  <div className={styles.details__content__item}>
                    <p
                      className={`${typo.body} ${typo.bold} ${styles.details__content__item__title}`}
                    >
                      Release Date
                    </p>
                    <p className={typo.body}>
                      {new Date(tvData.first_air_date).toLocaleDateString(
                        "en-US",
                        {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </p>
                  </div>
                ) : null}
                {tvData.spoken_languages &&
                tvData.spoken_languages.length > 0 ? (
                  <div className={styles.details__content__item}>
                    <p
                      className={`${typo.body} ${typo.bold} ${styles.details__content__item__title}`}
                    >
                      Languages
                    </p>
                    <p className={typo.body}>
                      {tvData.spoken_languages.map((lang, i) => {
                        let out = "";
                        if (i !== 0) out += ", ";
                        out += lang.name;
                        return out;
                      })}
                    </p>
                  </div>
                ) : null}
                {tvData.status ? (
                  <div className={styles.details__content__item}>
                    <p
                      className={`${typo.body} ${typo.bold} ${styles.details__content__item__title}`}
                    >
                      Status
                    </p>
                    <p className={typo.body}>{tvData.status}</p>
                  </div>
                ) : null}
                {tvData.type ? (
                  <div className={styles.details__content__item}>
                    <p
                      className={`${typo.body} ${typo.bold} ${styles.details__content__item__title}`}
                    >
                      Type
                    </p>
                    <p className={typo.body}>{tvData.type}</p>
                  </div>
                ) : null}
                {tvData.number_of_episodes ? (
                  <div className={styles.details__content__item}>
                    <p
                      className={`${typo.body} ${typo.bold} ${styles.details__content__item__title}`}
                    >
                      Seasons / Episodes
                    </p>
                    <p className={typo.body}>
                      {tvData.number_of_seasons} Seasons,&nbsp;
                      {tvData.number_of_episodes} Episodes
                    </p>
                  </div>
                ) : null}
                {tvData.networks && tvData.networks.length > 0 ? (
                  <div className={styles.details__content__item}>
                    <p
                      className={`${typo.body} ${typo.bold} ${styles.details__content__item__title}`}
                    >
                      Studios
                    </p>
                    <p className={typo.body}>
                      {tvData.networks.map((studio, i) => {
                        let out = "";
                        if (i !== 0) out += ", ";
                        out += studio.name;
                        return (
                          <Link
                            to={`/tv/network/${studio.id}`}
                            key={`tv_detail_network_${studio.id}`}
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
      {tvData ? (
        <div className={styles.content}>
          {tvData && tvData.seasonData ? (
            <Episodes
              globalRequests={redux_requests}
              data={tvData}
              mobile={mobile}
            />
          ) : null}
          {tvData.credits &&
          tvData.credits.cast &&
          tvData.credits.cast.length > 0 ? (
            <Carousel
              title="Top Billed Cast"
              data={tvData.credits.cast}
              type="people"
              key={`${tvData.id}_cast`}
              id={`${tvData.id}_cast`}
            />
          ) : null}
          {tvData.belongs_to_collection &&
          tvData.collection &&
          tvData.collection.length > 0 ? (
            <Carousel
              title={tvData.belongs_to_collection.name}
              data={tvData.collection}
              type="tv"
              key={`${tvData.id}_collection_${tvData.belongs_to_collection.id}`}
              id={`${tvData.id}_collection_${tvData.belongs_to_collection.id}`}
            />
          ) : null}
          <Carousel
            title="Related Shows"
            data={tvData.recommendations}
            type="tv"
            key={`${tvData.id}_related`}
            id={`${tvData.id}_related`}
          />
        </div>
      ) : null}
    </div>
  );
}

export default connect(mapStateToProps)(Tv);
