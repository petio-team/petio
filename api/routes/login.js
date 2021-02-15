const jwt = require("jsonwebtoken");
const request = require("xhr-request");
// Config
const getConfig = require("../util/config");

const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Admin = require("../models/admin");
const logger = require("../util/logger");

router.post("/", async (req, res) => {
  const prefs = getConfig();
  const admin = req.body.admin;
  const authToken = req.body.authToken;
  const user = req.body.user;
  const request_ip =
    req.headers["x-forwarded-for"] || req.connection.remoteAddress;

  if (!prefs) {
    res.status(500).send("This Petio API is not setup");
    return;
  }

  logger.log("info", `LOGIN: New login attempted`);
  logger.log("info", `LOGIN: Request User: ${user.username}`);
  logger.log("info", `LOGIN: Request IP: ${request_ip}`);

  if (authToken) {
    validateToken(res, authToken, prefs, request_ip);
    return;
  } else {
    if (!user.username) {
      res.json({
        admin: false,
        loggedIn: false,
        user: false,
        token: false,
      });
      logger.log("warn", `LOGIN: No username Request IP: ${request_ip}`);
      return;
    }
    logger.log("info", `LOGIN: Standard auth`);
    let username = user.username;
    let password = user.password;

    let adminUser = await Admin.findOne({
      $or: [{ username: username }, { email: username }],
    });

    if (adminUser) {
      if (parseInt(prefs.login_type) === 1 || admin) {
        if (password === adminUser.password) {
          let token = createToken(adminUser, true);
          adminUser.password = "removed";
          res.json({
            admin: true,
            loggedIn: true,
            user: adminUser,
            token: token,
          });
          return;
        } else {
          res.json({ admin: false, loggedIn: false, token: false });
          logger.log("warn", `LOGIN: Admin user not found`);
          logger.log(
            "warn",
            `Failed login with username: ${username} | IP: ${request_ip}`
          );
          return;
        }
      } else if (parseInt(prefs.login_type) === 2 && !admin) {
        let token = createToken(adminUser, true);
        adminUser.password = "removed";
        res.json({
          admin: true,
          loggedIn: true,
          user: adminUser,
          token: token,
        });
        return;
      }
      res.json({ admin: false, loggedIn: false, token: false });
      logger.log("warn", `LOGIN: Admin user not found`);
      logger.log(
        "warn",
        `Failed login with username: ${username} | IP: ${request_ip}`
      );
      return;
    } else if (!admin) {
      let friendUser = await User.findOne({
        $or: [{ username: username }, { email: username }, { title: username }],
      });
      if (friendUser) {
        if (friendUser.disabled) {
          res.json({ admin: false, loggedIn: false, token: false });
          logger.log("warn", `LOGIN: User is disabled`);
          logger.log(
            "warn",
            `Failed login with username: ${username} | IP: ${request_ip}`
          );
          return;
        } else if (parseInt(prefs.login_type) === 1) {
          if (friendUser.custom || friendUser.password) {
            if (password === friendUser.password) {
              let token = createToken(friendUser, false);
              friendUser.password = "removed";
              res.json({
                admin: false,
                loggedIn: true,
                user: friendUser,
                token: token,
              });
              return;
            }
          } else {
            let auth = await plexAuth(username, password);
            if (auth) {
              let token = createToken(friendUser, false);
              friendUser.password = "removed";
              res.json({
                admin: false,
                loggedIn: true,
                user: friendUser,
                token: token,
              });
              return;
            }
          }
        } else {
          let token = createToken(friendUser, false);
          friendUser.password = "removed";
          res.json({
            admin: false,
            loggedIn: true,
            user: friendUser,
            token: token,
          });
          return;
        }
        res.json({ admin: false, loggedIn: false, token: false });
        logger.log("warn", `LOGIN: No user found`);
        logger.log(
          "warn",
          `Failed login with username: ${username} | IP: ${request_ip}`
        );
        return;
      }
    }
    res.json({ admin: false, loggedIn: false, token: false });
    logger.log("warn", `LOGIN: No user found`);
    logger.log(
      "warn",
      `Failed login with username: ${username} | IP: ${request_ip}`
    );
  }
});

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
          "X-Plex-Client-Identifier": "df9e71a5-a6cd-488e-8730-aaa9195f7435",
          Authorization:
            "Basic " +
            Buffer.from(`${username}:${password}`).toString("base64"),
        },
      },
      function (err, data) {
        if (err) {
          resolve(false);
        }
        if (!data) {
          resolve(false);
        } else {
          if (data.error) {
            resolve(false);
          }
          resolve(true);
        }
      }
    );
  });
}

async function validateToken(res, authToken, prefs, request_ip) {
  logger.log("info", `LOGIN: JWT Token Passed`);
  try {
    let decoded = jwt.verify(authToken, prefs.plexToken);
    let userData = decoded;
    logger.log("info", `LOGIN: Token fine`);
    if (userData.admin) {
      logger.log("info", `LOGIN: Token is admin`);
      getAdmin(userData.username, userData.password, res, request_ip);
    } else {
      if (!userData.username) {
        throw "No username";
      }
      logger.log("info", `LOGIN: Token is user`);
      getFriend(userData.username, res, request_ip);
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
}

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
    let token = createToken(admin, true);
    admin.password = "removed";
    res.json({
      admin: true,
      loggedIn: true,
      user: admin,
      token: token,
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
    let token = createToken(friend, false);
    friend.password = "removed";
    res.json({
      admin: false,
      loggedIn: true,
      user: friend,
      token: token,
    });
    try {
      await User.updateOne(
        { _id: friend._id },
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
