const Movie = require("../models/movie");
const Show = require("../models/show");
const User = require("../models/user");
const logger = require("./logger");

async function setupReady() {
  try {
    let [movie, show, user] = await Promise.all([
      Movie.findOne(),
      Show.findOne(),
      User.findOne(),
    ]);
    if (movie && show && user) {
      return {
        ready: true,
        error: false,
      };
    } else {
      return {
        ready: false,
        error: false,
      };
    }
  } catch {
    logger.error("CHK: Fatal Error unable to write Db to file!");
    return {
      ready: false,
      error: "Database write error",
    };
  }
}

module.exports = setupReady;
