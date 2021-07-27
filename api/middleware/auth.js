import jwt from "jsonwebtoken";
import logger from "../util/logger";
import getConfig from "../util/config";
import User from "../models/user";

async function authenticate(req) {
  const prefs = getConfig();
  const { authorization: header } = req.headers;
  let petioJwt;
  if (req.body.authToken) {
    petioJwt = req.body.authToken;
  } else if (req.cookies && req.cookies.petio_jwt) {
    petioJwt = req.cookies.petio_jwt;
  } else if (header && /^Bearer (.*)$/.test(header)) {
    const match = /^Bearer (.*)$/.exec(header);
    petioJwt = match[1];
  } else {
    throw `AUTH: No auth token provided - route ${req.path}`;
  }
  req.jwtUser = jwt.verify(petioJwt, prefs.plexToken);

  try {
    let userData = await User.findOne({ id: req.jwtUser.id });
    return userData.toObject();
  } catch (_) {
    throw `AUTH: User ${req.jwtUser.id} not found in DB - route ${req.path}`;
  }
}

export {authenticate};

export async function authRequired(req, res, next) {
  try {
    await authenticate(req);
  } catch (e) {
    logger.log("warn", `AUTH: user is not logged in`);
    logger.warn(e);
    res.sendStatus(401);
    return;
  }
  next();
}

export function adminRequired(req, res, next) {
  if (req.jwtUser && req.jwtUser.admin) {
    next();
  } else {
    res.sendStatus(403);
    logger.log("warn", `AUTH: User not admin`);
  }
}
