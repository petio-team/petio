const jwt = require("jsonwebtoken");
const request = require("xhr-request");
// Config
const getConfig = require("../util/config");

const express = require("express");
const router = express.Router();
const User = require("../models/user");
const logger = require("../util/logger");
const bcrypt = require("bcryptjs");
const { authenticate } = require("../middleware/auth");

router.post("/", async (req, res) => {
  const prefs = getConfig();
  const request_ip =
    req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  const {
    user: { username, password },
  } = req.body || { user: {} };

  if (!prefs) {
    res.status(500).send("This Petio API is not setup");
    return;
  }

  if (!prefs.login_type) {
    prefs.login_type = 1;
  }

  logger.log("info", `LOGIN: New login attempted`);
  logger.log("info", `LOGIN: Request IP: ${request_ip}`);

  function success(user, isAdmin = false) {
    user.password = null;
    const token = jwt.sign({ ...user, admin: isAdmin }, prefs.plexToken);
    res
      .cookie("petio_jwt", token, {
        path: "/",
        httpOnly: true,
        maxAge: 2419200000,
        sameSite: "strict",
        secure: false,
      })
      .json({
        loggedIn: true,
        user,
        token,
        admin: isAdmin,
      });
  }

  // check for existing jwt
  try {
    const user = await authenticate(req);
    success(user, req.jwtUser.admin);
    logger.log("info", `LOGIN: Request User: ${user.username}`);
    return;
  } catch (e) {
    // if existing jwt failed, continue onto normal login flow
  }

  logger.log("info", `LOGIN: Request User: ${username}`);

  try {
    // Find user in db
    let dbUser = await User.findOne({
      $or: [{ username: username }, { email: username }, { title: username }],
    });
    if (!dbUser) throw "User not found";

    if (dbUser.disabled) throw "User is disabled";

    let isAdmin = dbUser.role === "admin" || dbUser.role === "moderator";

    if (parseInt(prefs.login_type) === 1 || password) {
      if (dbUser.password) {
        if (!bcrypt.compareSync(password, dbUser.password)) {
          throw "Password is incorrect";
        }
      } else {
        // throws on invalid credentials
        await plexAuth(username, password);
      }
      success(dbUser.toObject(), isAdmin);
    } else {
      // passwordless login, no check required. But we downgrade admin perms
      success(dbUser.toObject(), false);
    }
    saveRequestIp(dbUser, request_ip);
  } catch (err) {
    logger.log("warn", `LOGIN: User not found ${username} - ${request_ip}`);
    logger.warn(err);
    res.json({ loggedIn: false, user: null, admin: false, token: null });
  }
});

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

async function saveRequestIp(user, request_ip) {
  try {
    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          lastIp: request_ip,
        },
      }
    );
  } catch (err) {
    logger.log("error", "LOGIN: Update IP failed");
    logger.log({ level: "error", message: err });
  }
}

module.exports = router;
