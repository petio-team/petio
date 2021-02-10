const jwt = require("jsonwebtoken");
// Config
const getConfig = require("../util/config");

const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Admin = require("../models/admin");
const logger = require("../util/logger");

router.post("/", async (req, res) => {
  const prefs = getConfig();
  let admin = req.body.admin;
  let authToken = req.body.authToken;
  let username = req.body.username;
  let password = req.body.password;
  let request_ip =
    req.headers["x-forwarded-for"] || req.connection.remoteAddress;

  if (!prefs) {
    res.status(500).send("This Petio API is not setup");
    return;
  }

  logger.log("info", `LOGIN: New login attempted`);
  logger.log("info", `LOGIN: Request User: ${username}`);
  logger.log("info", `LOGIN: Request IP: ${request_ip}`);
  if (authToken) {
    logger.log("info", `LOGIN: JWT Token Passed`);
    try {
      let decoded = jwt.verify(authToken, prefs.plexToken);
      let user = decoded;
      logger.log("info", `LOGIN: Token fine`);
      if (user.admin) {
        logger.log("info", `LOGIN: Token is admin`);
        getAdmin(user.username, user.password, res, request_ip);
      } else {
        if (!user.username) {
          throw "No username";
        }
        logger.log("info", `LOGIN: Token is user`);
        getFriend(user.username, res, request_ip);
      }
    } catch {
      logger.log("warn", `LOGIN: Invalid token, rejected`);
      res.json({
        admin: false,
        loggedIn: false,
        user: false,
        token: false,
      });
      return;
    }
  } else {
    logger.log("info", `LOGIN: Standard auth`);
    if (!username || (!password && admin)) {
      res.json({
        admin: false,
        loggedIn: false,
        user: false,
        token: false,
      });
      return;
    }
    if (admin) {
      logger.log("info", `LOGIN: User is admin`);
      getAdmin(username, password, res, request_ip);
    } else {
      logger.log("info", `LOGIN: User is standard`);
      getFriend(username, res, request_ip);
    }
  }
});

function createToken(user, admin = false) {
  const prefs = getConfig();
  return jwt.sign(
    { username: user.username, password: user.password, admin: admin },
    prefs.plexToken
  );
}

async function getAdmin(username, password, res, request_ip) {
  let admin = await Admin.findOne({
    $or: [
      { username: username, password: password },
      { email: username, password: password },
    ],
  });

  if (admin) {
    logger.log("info", `LOGIN: Admin user found`);
    admin.password = "removed";
    res.json({
      admin: true,
      loggedIn: true,
      user: admin,
      token: createToken(admin, true),
    });
    try {
      await Admin.updateOne(
        { _id: admin._id },
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
  } else {
    logger.log("warn", `LOGIN: Admin user not found`);
    logger.log(
      "warn",
      `Failed login with username: ${username} | IP: ${request_ip}`
    );
    res.json({
      admin: false,
      loggedIn: false,
      user: admin,
      token: false,
    });
  }
}

async function getFriend(username, res, request_ip) {
  let friend = await User.findOne({
    $or: [{ username: username }, { email: username }, { title: username }],
  });
  if (friend) {
    if (friend.disabled) {
      res.json({ admin: false, loggedIn: false, token: false });
      return;
    }
    logger.log("info", `LOGIN: User found`);
    friend.password = "removed";
    res.json({
      admin: false,
      loggedIn: true,
      user: friend,
      token: createToken(friend, false),
    });
    friend.lastIp = request_ip;
    friend.save();
  } else {
    let admin = await Admin.findOne({
      $or: [{ username: username }, { email: username }],
    });
    if (admin) {
      logger.log("info", `LOGIN: User found, is admin, returned as standard`);
      admin.password = "removed";
      res.json({
        admin: false,
        loggedIn: true,
        user: admin,
        token: createToken(admin, false),
      });
      try {
        await Admin.updateOne(
          { _id: admin._id },
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
    } else {
      logger.log("warn", `LOGIN: No user found`);
      logger.log(
        "warn",
        `Failed login with username: ${username} | IP: ${request_ip}`
      );
      res.json({ admin: false, loggedIn: false, token: false });
    }
  }
}

module.exports = router;
