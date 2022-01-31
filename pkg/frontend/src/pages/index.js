import { useEffect } from "react";
import { Link } from "react-router-dom";
import media from "../services/media.service";
import { connect } from "react-redux";

import Meta from "../components/meta";
import Carousel from "../components/carousel";
import Hero from "../components/hero";

import hero from "../styles/components/hero.module.scss";
import typo from "../styles/components/typography.module.scss";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/opacity.css";
import { Loading } from "../components/loading";

const mapStateToProps = (state) => {
  return {
    redux_trending: state.media.trending,
    redux_movies: state.media.movies,
    redux_discovery: state.media.discovery,
    redux_featured: state.media.featured,
  };
};

function Home({
  newNotification,
  redux_trending,
  redux_movies,
  redux_discovery,
  redux_featured,
}) {
  useEffect(() => {
    async function getTrending() {
      try {
        media.getTrending();
      } catch (e) {
        console.log(e);
        newNotification({
          type: "error",
          message: "Error loading trending",
        });
      }
    }

    async function getPersonalised() {
      try {
        await Promise.all([
          media.getDiscovery("movies"),
          media.getDiscovery("tv"),
        ]);
      } catch (e) {
        console.log(e);
        newNotification({
          type: "error",
          message: "Couldn't load personalised recommendations",
        });
      }
    }

    async function init() {
      getTrending();
      getPersonalised();
    }

    init();
    //eslint-disable-next-line
  }, []);

  const discoveryMovies =
    redux_discovery.movies.length > 0
      ? redux_discovery.movies
      : [
          { title: "", results: "placeholder" },
          { title: "", results: "placeholder" },
          { title: "", results: "placeholder" },
        ];

  const discoveryTv =
    redux_discovery.tv.length > 0
      ? redux_discovery.tv
      : [
          { title: "", results: "placeholder" },
          { title: "", results: "placeholder" },
          { title: "", results: "placeholder" },
        ];

  return (
    <>
      <Meta title={"Home"} />
      {!redux_featured ? <Loading /> : null}
      <div>
        <div className={hero.discovery}>
          <div className="container">
            <div className={hero.discovery__content}>
              {redux_featured ? (
                <p className={typo.featured_title}>Featured Movie</p>
              ) : null}
              {redux_featured ? (
                <Link
                  to={`/movie/${redux_featured.id}`}
                  className={hero.discovery__logo}
                >
                  {redux_featured.logo ? (
                    <LazyLoadImage
                      src={redux_featured.logo}
                      alt={redux_featured.title}
                      effect="opacity"
                      visibleByDefault={true}
                    />
                  ) : (
                    <p>{redux_featured.title}</p>
                  )}
                </Link>
              ) : null}
            </div>
          </div>
          <div className={hero.discovery__background}>
            {redux_featured ? (
              <Hero
                className={hero.discovery__image}
                image={redux_featured.backdrop_path}
              />
            ) : null}
          </div>
        </div>
        <Carousel
          title="Trending Movies"
          data={redux_trending.movies}
          type="movie"
          key="trending_m"
          id="trending_m"
        />
        <Carousel
          title="Trending TV"
          data={redux_trending.tv}
          type="tv"
          key="trending_t"
          id="trending_t"
        />
        <Carousel
          title="Movie Studios"
          data={redux_trending.companies}
          type="company"
          key="trending_s"
          id="trending_s"
        />
        <Carousel
          title="TV Networks"
          data={redux_trending.networks}
          type="network"
          key="trending_n"
          id="trending_n"
        />
        {discoveryMovies.map((row, i) => {
          if (!row || !row.results || row.results.length === 0) return null;
          if (row.results === "placeholder") row.results = false;
          return (
            <Carousel
              key={`personal_movies_${i}`}
              id={`personal_movies_${i}`}
              title={row.title}
              data={row.results}
              type="movie"
            />
          );
        })}
        {discoveryTv.map((row, i) => {
          if (!row || !row.results || row.results.length === 0) return null;
          if (row.results === "placeholder") row.results = false;
          return (
            <Carousel
              key={`personal_tv_${i}`}
              id={`personal_tv_${i}`}
              title={row.title}
              data={row.results}
              type="tv"
            />
          );
        })}
      </div>
    </>
  );
}

export default connect(mapStateToProps)(Home);
