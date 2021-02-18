const jwt = require("jsonwebtoken");

const getConfig = require("../util/config");
exports.authRequired = (req, res, next) => {
  try {
    const prefs = getConfig();
    const { petio_jwt } = req.cookies;
    const jwtUser = jwt.verify(petio_jwt, prefs.plexToken);
    if (!jwtUser.username) {
      throw "no username";
    }
    logger.log("verbose", `AUTH: Token fine for ${jwtUser.username}`);
    req.jwtUser = jwtUser;
    next();
  } catch (error) {
    res.sendStatus(401);
    logger.log("warn", `AUTH: Invalid token, rejected`);
    logger.warn(error);
  }
};

exports.adminRequired = (req, res, next) => {
  if (jwtUser && jwtUser.admin) {
    logger.log("verbose", `AUTH: Admin check for ${jwtUser.username} passed`);
    next();
  } else {
    res.sendStatus(403);
    logger.log("warn", `AUTH: User not admin`);
  }
};
