const jwt = require("jsonwebtoken");

const logger = require("../util/logger");

const getConfig = require("../util/config");

function authenticate(req) {
  const prefs = getConfig();
  const { authorization: header } = req.headers;
  let petioJwt;
  if (req.cookies && req.cookies.petio_jwt) {
    petioJwt = req.cookies.petio_jwt;
  } else if (header && /^Bearer (.*)$/.test(header)) {
    const match = /^Bearer (.*)$/.exec(header);
    petioJwt = match[1];
  } else {
    throw `AUTH: No auth token provided - route ${req.path}`;
  }
  req.jwtUser = jwt.verify(petioJwt, prefs.plexToken);
  return req.jwtUser;
}

exports.authenticate = authenticate;

exports.authRequired = (req, res, next) => {
  try {
    authenticate(req);
  } catch (e) {
    logger.log("warn", `AUTH: user is not logged in`);
    logger.warn(e);
    res.sendStatus(401);
    return;
  }
  logger.log("verbose", `AUTH: Token fine for ${req.jwtUser.username}`);
  next();
};

exports.adminRequired = (req, res, next) => {
  if (req.jwtUser && req.jwtUser.admin) {
    logger.log(
      "verbose",
      `AUTH: Admin check for ${req.jwtUser.username} passed`
    );
    next();
  } else {
    res.sendStatus(403);
    logger.log("warn", `AUTH: User not admin`);
  }
};
