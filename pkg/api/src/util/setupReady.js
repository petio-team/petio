const Movie = require("../models/movie");
const Show = require("../models/show");
const User = require("../models/user");
const logger = require("../app/logger");

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
    logger.error("setup ready check failed to get ready");
    return {
      ready: false,
      error: "setup ready failed",
    };
  }
}

module.exports = setupReady;
