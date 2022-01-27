import media from "../../../services/media.service";

import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/opacity.css";

import { Loading } from "../../../components/loading";
import Meta from "../../../components/meta";
import Hero from "../../../components/hero";
import Grid from "../../../components/grid";

import hero from "../../../styles/components/hero.module.scss";
import styles from "../../../styles/views/company.module.scss";
import NotFound from "../../404";

export default function Studio() {
  const [coData, setCoData] = useState(null);
  const [movies, setMovies] = useState(false);
  // const [total, setTotal] = useState(1);
  const [featuredMovie, setFeaturedMovie] = useState(false);
  const { pid } = useParams();

  useEffect(() => {
    async function getCoDetails() {
      try {
        const movieData = await media.getCompany(pid);
        const moviesLookup = await media.lookup("movie", 1, {
          with_companies: pid,
        });
        setCoData(movieData);
        setMovies(moviesLookup.results);
        setTotal(moviesLookup.totalPages);
        setFeaturedMovie(moviesLookup.results[0]);
      } catch (e) {
        console.log(e);
        setCoData("error");
      }
    }

    getCoDetails();
  }, [pid]);

  if (!coData) return <Loading />;

  if (coData === "error") return <NotFound />;

  return (
    <div className={styles.wrap} key={`company_single_${pid}`}>
      <Meta title={coData.name} />
      <div className={`${hero.discovery} ${hero.company}`}>
        <div className="container">
          <div
            className={`${hero.discovery__content} ${hero.company__content}`}
          >
            <div className={hero.company__logo}>
              {coData.logo_path ? (
                <LazyLoadImage
                  src={`https://image.tmdb.org/t/p/w780_filter(duotone,ffffff,bdbdbd)${coData.logo_path}`}
                  alt={coData.name}
                  effect="opacity"
                  visibleByDefault={true}
                />
              ) : (
                <p>{coData.name}</p>
              )}
            </div>
          </div>
        </div>
        <div className={hero.company__background}>
          {featuredMovie ? (
            <Hero
              className={hero.discovery__image}
              image={featuredMovie.backdrop_path}
            />
          ) : null}
        </div>
      </div>
      <Grid
        title={`${coData.name} Movies`}
        data={movies}
        type="movie"
        key={`company_${pid}_movies`}
      />
    </div>
  );
}
