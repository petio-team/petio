import Movie from "../models/movie";
import Show from "../models/show";
import User from "../models/user";
import logger from "../app/logger";

export default async () => {
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