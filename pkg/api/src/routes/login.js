const jwt = require("jsonwebtoken");
const request = require("xhr-request");

const { conf } = require("../app/config");

const express = require("express");
const router = express.Router();
const User = require("../models/user");
const logger = require("../app/logger");
const bcrypt = require("bcryptjs");
const { authenticate } = require("../middleware/auth");
const getDiscovery = require("../discovery/display");
const getHistory = require("../plex/history");
const getTop = require("../plex/top");
const axios = require("axios");
const xmlParser = require("xml-js");

router.post("/", async (req, res) => {
  const request_ip = req.ip;
  const {
    user: { username, password },
  } = req.body || { user: {} };

  if (conf.get("admin.id") == -1) {
    res.status(500).send("This Petio API is not setup");
    return;
  }

  if (!conf.get("auth.type")) {
    conf.set("auth.type", 1);
  }

  logger.log("verbose", `LOGIN: New login attempted`);
  logger.log("verbose", `LOGIN: Request IP: ${request_ip}`);

  // check for existing jwt (skip if performing admin auth)
  if (!password)
    try {
      const user = await authenticate(req);
      success(user, req.jwtUser.admin, res);
      logger.log("verbose", `LOGIN: Request User: ${user.username}`);
      return;
    } catch (e) {
      // if existing jwt failed, continue onto normal login flow
      logger.log("verbose", `LOGIN: No JWT: ${req.body.user.username}`);
    }

  logger.log("verbose", `LOGIN: Request User: ${username}`);

  try {
    // Find user in db
    let dbUser = await User.findOne({
      $or: [
        { username: username },
        { email: username },
        { title: username },
        { nameLower: username.toLowerCase() },
      ],
    });
    if (!dbUser) throw "User not found";

    if (dbUser.disabled) throw "User is disabled";

    let isAdmin = dbUser.role === "admin" || dbUser.role === "moderator";

    if (conf.get("auth.type") === 1 || password) {
      if (dbUser.password) {
        if (!bcrypt.compareSync(password, dbUser.password)) {
          throw "Password is incorrect";
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
    logger.log("warn", `LOGIN: User not found ${username} - ${request_ip}`);
    logger.warn(err);
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
  logger.info(`LOGIN: Using Plex Auth for ${username}`);
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
          "X-Plex-Client-Identifier": "067e602b-1e86-4739-900d-1abdf8f6da71",
          Authorization:
            "Basic " +
            Buffer.from(`${username}:${password}`).toString("base64"),
        },
      },
      function (err, data) {
        if (err) {
          logger.warn(`LOGIN: Plex auth failed for ${username}`);
          reject();
        }
        if (!data) {
          logger.warn(`LOGIN: Plex auth error ${username}`);
          reject("LOGIN: Failed Plex Auth");
        } else if (data.error) {
          logger.warn(`LOGIN: Plex auth error ${username}`);
          reject("LOGIN: Failed Plex Auth");
        } else {
          logger.info(`LOGIN: Plex auth passed ${username}`);
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
    let dbUser = await User.findOne({ id: userId });
    if (!dbUser) throw "User not found";
    if (dbUser.disabled) throw "User is disabled";
    let isAdmin = dbUser.role === "admin" || dbUser.role === "moderator";
    success(dbUser.toObject(), isAdmin, res);
    saveRequestIp(dbUser, request_ip);
  } catch (err) {
    logger.error(err);
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
    logger.error(err);
    throw "Plex authentication failed";
  }
}

async function saveRequestIp(user, request_ip) {
  try {
    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          lastIp: request_ip,
          lastLogin: new Date(),
        },
      }
    );
  } catch (err) {
    logger.log("error", "LOGIN: Update IP failed");
    logger.log({ level: "error", message: err });
  }
}

module.exports = router;
