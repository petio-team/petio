import media from "../../../services/media.service";

import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import hero from "../../../styles/components/hero.module.scss";
import styles from "../../../styles/views/genre.module.scss";
import typo from "../../../styles/components/typography.module.scss";

import Meta from "../../../components/meta";
import Hero from "../../../components/hero";
import Grid from "../../../components/grid";
import { matchGenre } from "../../../helpers/genres";
import NotFound from "../../404";

export default function Genre() {
  const [genreName, setGenreName] = useState("");
  const [shows, setShows] = useState(false);
  // const [total, setTotal] = useState(1);
  const [featuredShow, setfeaturedShow] = useState(false);
  const { pid } = useParams();

  useEffect(() => {
    async function getGenreDetails() {
      try {
        const genreMatch = matchGenre("tv", pid);
        if (!genreMatch || !genreMatch.query) throw "not found";
        setGenreName(genreMatch.name);
        const showsLookup = await media.lookup("show", 1, genreMatch.query);
        setShows(showsLookup.results);
        setTotal(showsLookup.totalPages);
        setfeaturedShow(showsLookup.results[0]);
      } catch (e) {
        console.log(e);
        setGenreName("error");
      }
    }

    getGenreDetails();
  }, [pid]);

  if (genreName === "error") return <NotFound />;

  return (
    <div className={styles.wrap} key={`genre_single_show_${pid}`}>
      {!genreName ? (
        <>
          <Meta title="Loading" />
          <div className={`${hero.discovery} ${hero.genre}`}>
            <div className="container">
              <div
                className={`${hero.discovery__content} ${hero.genre__content}`}
              >
                <div className={hero.genre__title}>
                  <p className={`${typo.xltitle} ${typo.bold}`}>Loading</p>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <Meta title={genreName} />
          <div className={`${hero.discovery} ${hero.genre}`}>
            <div className="container">
              <div
                className={`${hero.discovery__content} ${hero.genre__content}`}
              >
                <div className={hero.genre__title}>
                  <p className={`${typo.xltitle} ${typo.bold}`}>
                    {genreName} TV
                  </p>
                </div>
              </div>
            </div>
            <div className={hero.genre__background}>
              {featuredShow ? (
                <Hero
                  className={hero.discovery__image}
                  image={featuredShow.backdrop_path}
                />
              ) : null}
            </div>
          </div>
          <Grid
            title={`${genreName} Shows`}
            data={shows}
            type="tv"
            key={`genre_${pid}_shows`}
            id={`genre_${pid}_shows`}
          />
        </>
      )}
    </div>
  );
}
