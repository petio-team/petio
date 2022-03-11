import jwt from "jsonwebtoken";

import logger from "../app/logger";
import { conf } from "../app/config";
import User from "../models/user";

export async function authenticate(req) {
  const { authorization: header } = req.headers;
  let petioJwt;
  if (req.body.authToken) {
    petioJwt = req.body.authToken;
  } else if (req.cookies && req.cookies.petio_jwt) {
    petioJwt = req.cookies.petio_jwt;
  } else if (header && /^Bearer (.*)$/.test(header)) {
    const match: any = /^Bearer (.*)$/.exec(header);
    petioJwt = match[1];
  } else {
    throw `AUTH: No auth token provided - route ${req.path}`;
  }
  req.jwtUser = jwt.verify(petioJwt, conf.get("plex.token"));

  try {
    let userData = await User.findOne({ id: req.jwtUser.id });
    return userData.toObject();
  } catch {
    throw `AUTH: User ${req.jwtUser.id} not found in DB - route ${req.path}`;
  }
}

export const authRequired = async (req, res, next) => {
  try {
    await authenticate(req);
  } catch (e) {
    logger.verbose(`AUTH: user is not logged in`, { label: "middleware.auth" });
    logger.debug(e, { label: "middleware.auth" });
    res.sendStatus(401);
    return;
  }
  next();
};

export const adminRequired = (req, res, next) => {
  if (req.jwtUser && req.jwtUser.admin) {
    next();
  } else {
    res.sendStatus(403);
    logger.warn(`AUTH: User not admin`, { label: "middleware.auth" });
  }
};
