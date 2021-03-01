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
    let compulsoryPass = true;
    let optionalMatch = 0;
    f.rows.map((row) => {
      if (row.comparison === "and") {
        // must match
        filterMatch = filterCompare(
          row.condition,
          row.value,
          row.operator,
          mediaDetails
        );
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
        if (filterMatch) optionalMatch++;
      }
    });
    if (
      filterMatch &&
      compulsoryPass &&
      (optionalMatch > 0 || f.rows.length === 1)
    ) {
      console.log(filterMatch, compulsoryPass, optionalMatch, f.rows.length);
      console.log(`Match on filter ${i + 1}`);
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
        values.push(new Date(media.release_date).getFullYear());
      break;
    case "age_rating":
      values = false;
      break;
    case "keyword":
      values = [];
      media.keywords.results.map((kw) => {
        values.push(kw.name);
      });
  }
  return values;
}

module.exports = filter;
