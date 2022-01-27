import grid from "../styles/components/grid.module.scss";
import cards from "../styles/components/card.module.scss";

import Card from "./card";

export default function Grid({ data, title, type = "movie", id }) {
  const placeholderRow = [];

  for (let i = 0; i < 10; i++) {
    placeholderRow.push(
      <div className={cards.grid__wrap}>
        <div
          key={`${id}_${i}`}
          className={
            type === "company"
              ? cards.placeholder__grid__wide
              : cards.placeholder__grid
          }
        ></div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className={grid.wrap}>
        {/* <p className={typo.grid_title}>{title}</p> */}
        <div className={grid.inner}>
          {data && data.length > 0
            ? data.map((item, i) => {
                if (item === "watched") return null;
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
                    key={`${id}__grid__${item.id}__${i}`}
                    title={type === "movie" ? item.title : item.name}
                    poster={poster}
                    video={video}
                    year={date ? new Date(date).getFullYear() : false}
                    type={type}
                    id={item.id}
                    character={item.character}
                    name={item.name}
                    item={item}
                    load={item.load}
                    grid={true}
                  />
                );
              })
            : placeholderRow}
        </div>
      </div>
    </div>
  );
}
