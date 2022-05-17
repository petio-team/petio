import express from "express";
import request from "xhr-request";

import Movie from "../models/movie";
import { movieLookup } from "../tmdb/movie";
import MakePlexURL from "../plex/util";
import logger from "../app/logger";

const router = express.Router();

router.get("/:id/movie", async (req, res) => {
  let id = req.params.id;
  let data: any = await buildData(id);
  Object.keys(data.movie.genre).map((i) => {
    let genre = data.movie.genre[i];
    if (genre.count === 1) delete data.movie.genre[i];
    genre.avgRating = genre.totalRating / genre.count;
  });
  Object.keys(data.movie.actor).map((i) => {
    let actor = data.movie.actor[i];
    if (actor.count === 1) delete data.movie.actor[i];
  });
  res.json(data);
});

async function buildData(id) {
  let data: any = await getHistory(id);
  if (data.MediaContainer.size === 0) {
    return { error: "No History" };
  }
  let items = data.MediaContainer.Metadata;
  let output = {
    raw: {},
    movie: {
      count: 0,
      genre: {},
      actor: {},
      director: {},
    },
  };

  if (items.length > 100) items.length = 100;

  for (let i = 0; i < items.length; i++) {
    let listItem = items[i];
    try {
      if (listItem.type === "movie") {
        let dbItem = await Movie.findOne({ ratingKey: listItem.ratingKey });
        if (dbItem) {
          let movieData: any = await movieLookup(dbItem.tmdb_id);
          // output.raw[movieData.id] = movieData;
          output.movie.count += 1;
          if (movieData.credits.cast) {
            if (movieData.credits.cast.length > 10)
              movieData.credits.cast.length = 10;
            for (let p = 0; p < movieData.credits.cast.length; p++) {
              let actor = movieData.credits.cast[p];
              if (!output.movie.actor[actor.id]) {
                output.movie.actor[actor.id] = {
                  name: actor.name,
                  count: 0,
                };
              }
              output.movie.actor[actor.id].count += 1;
            }
          }
          for (let g = 0; g < movieData.genres.length; g++) {
            let genre = movieData.genres[g];
            if (!output.movie.genre[genre.name]) {
              output.movie.genre[genre.name] = {
                name: genre.name,
                totalRating: 0,
                count: 0,
                id: genre.id,
              };
            }

            if (movieData.imdb_data.rating) {
              output.movie.genre[genre.name].totalRating += parseInt(
                movieData.imdb_data.rating.ratingValue
              );
              output.movie.genre[genre.name].count += 1;
            }
          }
        }
      }
    } catch (err) {
      logger.error(err);
    }
  }
  return output;
}

function getHistory(id) {
  return new Promise((resolve, reject) => {
    const url = MakePlexURL("/status/sessions/history/all", {
      sort: "viewedAt:desc",
      accountID: id,
      "viewedAt>=": "0",
      limit: 200,
    }).toString();

    request(
      url,
      {
        method: "GET",
        json: true,
      },
      function (err, data) {
        if (err) {
          reject(err);
        }
        resolve(data);
      }
    );
  });
}

export default router;
