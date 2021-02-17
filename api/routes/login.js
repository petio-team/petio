const jwt = require("jsonwebtoken");
const request = require("xhr-request");
// Config
const getConfig = require("../util/config");

const express = require("express");
const router = express.Router();
const User = require("../models/user");
const logger = require("../util/logger");
const bcrypt = require("bcrypt");

router.post("/", async (req, res) => {
  const prefs = getConfig();
  const admin = req.body.admin;
  const authToken = req.body.authToken;
  const user = req.body.user;
  const request_ip =
    req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  let userData = false;
  let token = false;
  let loggedIn = false;
  let username = user.username;
  let password = user.password;

  if (!prefs) {
    res.status(500).send("This Petio API is not setup");
    return;
  }

  if (!prefs.login_type) {
    prefs.login_type = 1;
  }

  logger.log("info", `LOGIN: New login attempted`);
  logger.log("info", `LOGIN: Request User: ${username}`);
  logger.log("info", `LOGIN: Request IP: ${request_ip}`);

  if (authToken) {
    try {
      let jwtUser = jwt.verify(authToken, prefs.plexToken);
      if (!jwtUser.username) {
        throw "No username";
      }

      logger.log("verbose", `LOGIN: Token fine`);
      username = jwtUser.username;
      password = jwtUser.password;
    } catch (err) {
      logger.log("warn", `LOGIN: Invalid token, rejected`);
      logger.warn(err);
    }
  }

  if (username) {
    try {
      // Find user in db
      let dbUser = await User.findOne({
        $or: [{ username: username }, { email: username }, { title: username }],
      });
      if (!dbUser.disabled) {
        // Check if user is disabled
        if (admin && dbUser.role !== "admin") {
          console.log("here");
          throw "User is not admin";
        }
        token = createToken(username, password, admin);
        if (
          (dbUser.password && parseInt(prefs.login_type) === 1) ||
          (admin && dbUser.password)
        ) {
          // If standard auth and db user has password or is admin panel
          let checkPass =
            dbUser.password && password
              ? bcrypt.compareSync(password, dbUser.password)
              : false;
          if (!checkPass) throw "Password hash failed";
        } else if (parseInt(prefs.login_type) === 1 || admin) {
          // Auth against plex, standard login and is plex user
          await plexAuth(username, password);
        }
        saveRequestIp(dbUser, request_ip);
        userData = dbUser;
        userData.password = "";
        loggedIn = true;
      }
    } catch (err) {
      logger.log("warn", `LOGIN: User not found ${username} - ${request_ip}`);
      logger.warn(err);
      token = false;
    }
  }

  res.json({
    loggedIn: loggedIn,
    user: userData,
    token: token,
    admin: admin ? true : false,
  });
});

function createToken(username, password, admin = false) {
  const prefs = getConfig();
  if (!prefs.login_type) {
    prefs.login_type = 1;
  }
  if (parseInt(prefs.login_type) === 2 && !admin) {
    password = "";
  }
  return jwt.sign({ username: username, password: password }, prefs.plexToken);
}

function plexAuth(username, password) {
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
          reject();
        }
        if (!data) {
          reject("Failed Plex Auth");
        } else {
          if (data.error) {
            reject("Failed Plex Auth");
          }
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
    logger.error(err);
  }
}

module.exports = router;
