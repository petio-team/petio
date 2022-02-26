import Movie from "../models/movie";
import Show from "../models/show";
import { conf } from "../app/config";

export default async (type, imdb, tvdb, tmdb) => {
  let clientId = conf.get("plex.client");
  if (type === "movie") {
    let foundItemsImdb: any = false;
    let foundItemsTvdb: any = false;
    let foundItemsTmdb: any = false;
    let found: any = false;

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

    let resolutions: any = [];

    if (found && found.length > 0) {
      let exists: any = [];
      Object.keys(found).forEach((i) => {
        let item: any = found[i];
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
    let foundItemsImdb: any = false;
    let foundItemsTvdb: any = false;
    let foundItemsTmdb: any = false;
    let found: any = false;

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
      let exists: any = [];
      let resolutions: any = [];
      Object.keys(found).forEach((i) => {
        let item = found[i];
        const seasons = item.seasonData;
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