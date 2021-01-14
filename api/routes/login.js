const jwt = require("jsonwebtoken");
// Config
const getConfig = require("../util/config");

const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Admin = require("../models/admin");

router.post("/", async (req, res) => {
  const prefs = getConfig();
  let admin = req.body.admin;
  let authToken = req.body.authToken;
  let username = req.body.username;
  let password = req.body.password;

  if (!prefs) {
    res.status(500).send("This Petio API is not setup");
    return;
  }

  console.log(`LOGIN: New login attempted`);
  console.log(`LOGIN: Request IP: ${req.connection.remoteAddress}`);
  if (authToken) {
    console.log(`LOGIN: JWT Token Passed`);
    try {
      let decoded = jwt.verify(authToken, prefs.plexToken);
      let user = decoded;
      console.log(`LOGIN: Token fine`);
      if (user.admin) {
        console.log(`LOGIN: Token is admin`);
        getAdmin(user.username, user.password, res, req);
      } else {
        console.log(`LOGIN: Token is user`);
        getFriend(user.username, res, req);
      }
    } catch {
      console.log(`LOGIN: Invalid token, rejected`);
      res.json({
        admin: false,
        loggedIn: false,
        user: false,
        token: false,
      });
      return;
    }
  } else {
    console.log(`LOGIN: Standard auth`);
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
      console.log(`LOGIN: User is admin`);
      getAdmin(username, password, res, req);
    } else {
      console.log(`LOGIN: User is standard`);
      getFriend(username, res, req);
    }
  }
});

function createToken(user, admin = false) {
  const prefs = getConfig();
  return jwt.sign({ username: user.username, password: user.password, admin: admin }, prefs.plexToken);
}

async function getAdmin(username, password, res, req) {
  let admin = await Admin.findOne({
    $or: [
      { username: username, password: password },
      { email: username, password: password },
    ],
  });

  if (admin) {
    console.log(`LOGIN: Admin user found`);
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
            lastIp: req.connection.remoteAddress,
          },
        }
      );
    } catch (err) {
      console.log(err);
    }
  } else {
    console.log(`LOGIN: Admin user not found`);
    res.json({
      admin: false,
      loggedIn: false,
      user: admin,
      token: false,
    });
  }
}

async function getFriend(username, res, req) {
  let friend = await User.findOne({
    $or: [{ username: username }, { email: username }, { title: username }],
  });
  if (friend) {
    console.log(`LOGIN: User found`);
    res.json({
      admin: false,
      loggedIn: true,
      user: friend,
      token: createToken(friend, false),
    });
    friend.lastIp = req.connection.remoteAddress;
    friend.save();
  } else {
    let admin = await Admin.findOne({
      $or: [{ username: username }, { email: username }],
    });
    if (admin) {
      console.log(`LOGIN: User found, is admin, returned as standard`);
      admin.password = "";
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
              lastIp: req.connection.remoteAddress,
            },
          }
        );
      } catch (err) {
        console.log(err);
      }
    } else {
      console.log(`LOGIN: No user found`);
      res.json({ admin: false, loggedIn: false, token: false });
    }
  }
}

module.exports = router;
