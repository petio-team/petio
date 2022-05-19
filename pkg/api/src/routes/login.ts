import jwt from "jsonwebtoken";
import request from "xhr-request";
import express from "express";
import bcrypt from "bcryptjs";
import axios from "axios";
import xmlParser from "xml-js";

import { conf, hasConfig } from "../app/config";
import { UserModel, UserRole } from "../models/user";
import logger from "../app/logger";
import { authenticate } from "../middleware/auth";
import getDiscovery from "../discovery/display";
import getHistory from "../plex/history";
import getTop from "../plex/top";

const router = express.Router();

router.post("/", async (req: any, res) => {
  const request_ip = req.ip;
  const {
    user: { username, password },
  } = req.body || { user: {} };

  if (hasConfig() === false) {
    res.status(500).send("This Petio API is not setup");
    return;
  }

  if (!conf.get("auth.type")) {
    conf.set("auth.type", 1);
  }

  logger.verbose(`LOGIN: New login attempted`, { label: "routes.login" });
  logger.verbose(`LOGIN: Request IP: ${request_ip}`, { label: "routes.login" });

  // check for existing jwt (skip if performing admin auth)
  if (!password)
    try {
      const user = await authenticate(req);
      success(user, req.jwtUser.admin, res);
      logger.verbose(`LOGIN: Request User: ${user.username}`, {
        label: "routes.login",
      });
      return;
    } catch (e) {
      // if existing jwt failed, continue onto normal login flow
      logger.verbose(`LOGIN: No JWT: ${req.body.user.username}`, {
        label: "routes.login",
      });
    }

  logger.verbose(`LOGIN: Request User: ${username}`, { label: "routes.login" });

  try {
    // Find user in db
    let dbUser = await UserModel.findOne({
      $or: [{ username: username }, { email: username }],
    });

    if (!dbUser) {
      res.status(401).json({
        error: "User not found",
      });
      logger.warn(`LOGIN: User not found ${username} - ${request_ip}`, {
        label: "routes.login",
      });
      return;
    }

    if (dbUser.disabled) {
      res.status(401).json({
        error: "User is disabled",
      });
      return;
    }

    let isAdmin = dbUser.role === UserRole.Admin;

    if (conf.get("auth.type") === 1 || password) {
      if (dbUser.password) {
        if (!bcrypt.compareSync(password, dbUser.password)) {
          res.status(401).json({
            error: "Password is incorrect",
          });
          return;
        }
      } else {
        // throws on invalid credentials
        await plexAuth(username, password);
      }
      success(dbUser.toObject(), isAdmin, res);
    } else {
      // passwordless login, no check required. But we downgrade admin perms
      success(dbUser.toObject(), false, res);
    }
    saveRequestIp(dbUser, request_ip);
  } catch (err) {
    logger.error(err, { label: "routes.login" });
    res
      .status(401)
      .json({ loggedIn: false, user: null, admin: false, token: null });
  }
});

function success(user, isAdmin = false, res) {
  user.password = null;
  const token = jwt.sign({ ...user, admin: isAdmin }, conf.get("plex.token"));
  res
    .cookie("petio_jwt", token, {
      maxAge: 2419200000,
    })
    .json({
      loggedIn: true,
      user,
      token,
      admin: isAdmin,
    });
  getTop(1);
  getTop(2);
  let userId = user.altId ? user.altId : user.id;
  try {
    getHistory(userId, "movie");
    getHistory(userId, "show");
    getDiscovery(userId, "movie");
    getDiscovery(userId, "show");
  } catch (err) {
    // No need to log
  }
}

function plexAuth(username, password) {
  logger.info(`LOGIN: Using Plex Auth for ${username}`, {
    label: "routes.login",
  });
  return new Promise((resolve, reject) => {
    request(
      "https://plex.tv/users/sign_in.json",
      {
        method: "POST",
        json: true,
        headers: {
          "X-Plex-Product": "Petio",
          "X-Plex-Platform-Version": "1.0",
          "X-Plex-Device-Name": "Petio API",
          "X-Plex-Version": "1.0",
          "X-Plex-Client-Identifier": conf.get("plex.client"),
          Authorization:
            "Basic " +
            Buffer.from(`${username}:${password}`).toString("base64"),
        },
      },
      function (err, data) {
        if (err) {
          logger.warn(`LOGIN: Plex auth failed for ${username}`, {
            label: "routes.login",
          });
          reject();
        }
        if (!data) {
          logger.warn(`LOGIN: Plex auth error ${username}`, {
            label: "routes.login",
          });
          reject("LOGIN: Failed Plex Auth");
        } else if (data.error) {
          logger.warn(`LOGIN: Plex auth error ${username}`, {
            label: "routes.login",
          });
          reject("LOGIN: Failed Plex Auth");
        } else {
          logger.info(`LOGIN: Plex auth passed ${username}`, {
            label: "routes.login",
          });
          resolve(data);
        }
      }
    );
  });
}

router.post("/plex_login", async (req, res) => {
  const request_ip = req.ip;
  const token = req.body.token;
  try {
    let userId = await plexOauth(token);
    let dbUser = await UserModel.findOne({ plexId: userId });
    if (!dbUser) {
      res.status(401).json({ error: "User not found" });
      return;
    }

    if (dbUser.disabled) {
      res.status(401).json({ error: "User is disabled" });
      return;
    }

    let isAdmin = dbUser.role === UserRole.Admin;
    success(dbUser.toObject(), isAdmin, res);
    saveRequestIp(dbUser, request_ip);
  } catch (err) {
    logger.error(err, { label: "routes.login" });
    res
      .status(401)
      .json({ loggedIn: false, user: null, admin: false, token: null });
  }
});

async function plexOauth(token) {
  let plex = await axios.get(
    `https://plex.tv/users/account?X-Plex-Token=${token}`
  );
  try {
    let data = JSON.parse(xmlParser.xml2json(plex.data, { compact: false }));
    let user = data.elements[0].attributes;
    return user.id;
  } catch (err) {
    logger.error(err, { label: "routes.login" });
    throw "Plex authentication failed";
  }
}

async function saveRequestIp(user, request_ip) {
  try {
    await UserModel.updateOne(
      { _id: user._id },
      {
        $set: {
          lastIp: request_ip,
          lastLogin: new Date(),
        },
      }
    );
  } catch (err) {
    logger.error("LOGIN: Update IP failed", { label: "routes.login" });
    logger.error(err, { label: "routes.login" });
  }
}

export default router;
