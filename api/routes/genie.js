const express = require("express");
const router = express.Router();
const request = require("xhr-request");
const Movie = require("../models/movie");
const { movieLookup, discoverMovie } = require("../tmdb/movie");

// Config
const getConfig = require("../util/config");

router.get("/:id/movie", async (req, res) => {
  let id = req.params.id;
  let data = await buildData(id);
  Object.keys(data.movie.genre).map((i) => {
    let genre = data.movie.genre[i];
    genre.avgRating = genre.totalRating / genre.count;
  });
  res.json(data);
});

async function buildData(id) {
  let data = await getHistory(id);
  if (data.MediaContainer.size === 0) {
    return { error: "No History" };
  }
  let items = data.MediaContainer.Metadata;
  let output = {
    raw: {},
    movie: {
      count: 0,
      genre: {},
    },
  };

  if (items.length > 100) items.length = 100;

  for (let i = 0; i < items.length; i++) {
    let listItem = items[i];
    try {
      if (listItem.type === "movie") {
        let dbItem = await Movie.findOne({ ratingKey: listItem.ratingKey });
        if (dbItem) {
          let movieData = await movieLookup(dbItem.tmdb_id);
          // output.raw[movieData.id] = movieData;
          output.movie.count += 1;
          for (let g = 0; g < movieData.genres.length; g++) {
            let genre = movieData.genres[g];
            if (!output.movie.genre[genre.name]) {
              output.movie.genre[genre.name] = {
                name: genre.name,
                totalRating: 0,
                count: 0,
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
      console.log(err);
    }
  }
  return output;
}

function getHistory(id) {
  const prefs = getConfig();
  return new Promise((resolve, reject) => {
    let url = `${prefs.plexProtocol}://${prefs.plexIp}:${prefs.plexPort}/status/sessions/history/all?sort=viewedAt%3Adesc&accountID=${id}&viewedAt>=0&limit=200&X-Plex-Token=${prefs.plexToken}`;
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

module.exports = router;
