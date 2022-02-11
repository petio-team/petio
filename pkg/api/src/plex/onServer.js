const Movie = require("../models/movie");
// const Music = require('../models/artist'); // to be added when music added
const Show = require("../models/show");
const { conf } = require("../app/config");

async function onServer(type, imdb, tvdb, tmdb) {
  let clientId = conf.get("plex.client");
  if (type === "movie") {
    let foundItemsImdb = false;
    let foundItemsTvdb = false;
    let foundItemsTmdb = false;
    let found = false;

    if (imdb) {
      foundItemsImdb = await Movie.find({
        imdb_id: imdb.toString(),
      }).exec();
      found = foundItemsImdb;
    }

    if (tvdb) {
      foundItemsTvdb = await Movie.find({
        externalId: tvdb.toString(),
      }).exec();
      found = foundItemsTvdb;
    }

    if (tmdb) {
      foundItemsTmdb = await Movie.find({
        tmdb_id: tmdb.toString(),
      }).exec();
      found = foundItemsTmdb;
    }

    let resolutions = [];

    if (found && found.length > 0) {
      let exists = [];
      Object.keys(found).forEach((i) => {
        let item = found[i];
        if (item.Media.length > 0) {
          resolutions.push(item.Media[0].videoResolution);
          exists.push({
            ratingKey: item.ratingKey,
            resolution: item.Media[0].videoResolution,
          });
        }
      });
      return {
        exists: {
          versions: exists,
          serverKey: clientId,
        },
        resolutions: resolutions,
      };
    } else {
      return { exists: false, resolutions: [] };
    }
  }

  if (type === "show" || type === "tv") {
    let foundItemsImdb = false;
    let foundItemsTvdb = false;
    let foundItemsTmdb = false;
    let found = false;

    if (imdb) {
      foundItemsImdb = await Show.find({
        imdb_id: imdb.toString(),
      }).exec();
      found = foundItemsImdb;
    }

    if (tvdb) {
      foundItemsTvdb = await Show.find({
        tvdb_id: tvdb.toString(),
      }).exec();
      found = foundItemsTvdb;
    }

    if (tmdb) {
      foundItemsTmdb = await Show.find({
        tmdb_id: tmdb.toString(),
      }).exec();
      found = foundItemsTmdb;
    }

    if (found && found.length > 0) {
      let exists = [];
      let resolutions = [];
      Object.keys(found).forEach((i) => {
        let item = found[i];
        seasons = item.seasonData;
        if (
          seasons &&
          seasons[1] &&
          seasons[1].episodes &&
          seasons[1].episodes[1] &&
          seasons[1].episodes[1].resolution
        ) {
          resolutions.push(seasons[1].episodes[1].resolution);
          exists.push({
            ratingKey: item.ratingKey,
            seasons: seasons,
            resolution: seasons[1].episodes[1].resolution,
          });
        } else {
          exists.push({
            ratingKey: item.ratingKey,
            seasons: seasons,
            resolution: "unknown",
          });
        }
      });
      return {
        exists: {
          versions: exists,
          serverKey: clientId,
        },
        resolutions: resolutions,
      };
    } else {
      return { exists: false, resolutions: [] };
    }
  }
}

module.exports = onServer;
