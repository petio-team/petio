const logger = require("../util/logger");
const Filter = require("../models/filter");
const { movieLookup } = require("../tmdb/movie");
const { showLookup } = require("../tmdb/show");

async function filter(item) {
  if (!item.tmdb_id) return false;
  let filterMatch = false;
  let action = false;

  let mediaDetails =
    item.type === "movie"
      ? await movieLookup(item.tmdb_id)
      : await showLookup(item.tmdb_id);
  let filterId = item.type === "movie" ? "movie_filters" : "tv_filters";
  let filters = await Filter.findOne({ id: filterId });
  if (!mediaDetails || !filters) return false;
  filters.data.map((f, i) => {
    if (action) return;
    let compulsoryPass = true;
    let optionalMatch = 0;
    let hasMatched = false;
    f.rows.map((row, i) => {
      if (row.comparison === "and" && i > 0) {
        // must match
        filterMatch = filterCompare(
          row.condition,
          row.value,
          row.operator,
          mediaDetails
        );
        if (filterMatch) {
          hasMatched = true;
        }
        if (!filterMatch) {
          compulsoryPass = false;
        }
      } else {
        // can match

        filterMatch = filterCompare(
          row.condition,
          row.value,
          row.operator,
          mediaDetails
        );
        if (filterMatch) {
          hasMatched = true;
          optionalMatch++;
        }
      }
    });
    if (
      hasMatched &&
      compulsoryPass &&
      (optionalMatch > 0 || f.rows.length === 1)
    ) {
      logger.info(`FILT: Match on filter ${i + 1}`);
      action = f.action;
    }
  });

  return action;
}

function filterCompare(condition, value, operator, media) {
  let mediaValues = getValue(condition, media);
  let match = false;
  mediaValues.map((mediaValue) => {
    switch (operator) {
      case "equal":
        if (mediaValue == value) match = true;
        break;
      case "not":
        if (mediaValue != value) match = true;
        break;
      case "greater":
        if (mediaValue > value) match = true;
        break;
      case "less":
        if (mediaValue < value) match = true;
    }
  });

  return match;
}

function getValue(condition, media) {
  let values = false;
  switch (condition) {
    case "genre":
      values = [];
      media.genres.map((genre) => {
        values.push(genre.id);
      });
      if (media.keywords && Array.isArray(media.keywords.results))
        if (media.keywords.results)
          media.keywords.results.map((kw) => {
            if (kw.id === 210024) values.push("anime");
          });
      break;
    case "year":
      values = [];
      if (media.release_date)
        values.push(new Date(media.release_date).getFullYear());
      if (media.first_air_date)
        values.push(new Date(media.first_air_date).getFullYear());
      break;
    case "age_rating":
      values = [media.age_rating];
      break;
    case "keyword":
      values = [];
      if (media.keywords && Array.isArray(media.keywords.results))
        media.keywords.results.map((kw) => {
          values.push(kw.name);
        });
    case "language":
      values = [];
      if (media.original_language) values.push(media.original_language);
      break;
    case "popularity":
      values = [];
      if (media.popularity) values.push(media.popularity);
      break;
    case "networks":
      values = [];
      if (media.networks && Array.isArray(media.networks.results))
        media.networks.results.map((nw) => {
          values.push(nw.name);
        });
      break;
    case "companies":
      values = [];
      if (
        media.production_companies &&
        Array.isArray(media.production_companies.results)
      )
        media.production_companies.results.map((cp) => {
          values.push(cp.name);
        });
      break;
  }
  return values;
}

module.exports = filter;
