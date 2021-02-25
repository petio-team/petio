const express = require("express");
const router = express.Router();
const User = require("../models/user");
const http = require("follow-redirects").http;
const logger = require("../util/logger");
const bcrypt = require("bcryptjs");
const { adminRequired, authRequired } = require("../middleware/auth");

router.get("/thumb/:id", async (req, res) => {
  let userData = false;
  try {
    userData = await User.findOne({ id: req.params.id });
  } catch (err) {
    res.json({ error: err });
    return;
  }

  if (userData) {
    let url = userData.thumb;

    var options = {
      host: "plex.tv",
      path: url.replace("https://plex.tv", ""),
      method: "GET",
      headers: {
        "content-type": "image/png",
      },
    };

    var request = http
      .get(options, function (response) {
        res.writeHead(response.statusCode, {
          "Content-Type": response.headers["content-type"],
        });
        response.pipe(res);
      })
      .on("error", function (e) {
        logger.log(
          "warn",
          "ROUTE: Unable to get user thumb - Got error: " + e.message,
          e
        );
      });
    request.end();
  }
});

router.use(authRequired);

router.get("/all", adminRequired, async (req, res) => {
  try {
    userData = await User.find();
  } catch (err) {
    res.json({ error: err });
    return;
  }

  if (userData) {
    let data = Object.values(Object.assign(userData));
    Object.keys(data).map((u) => {
      let user = data[u];
      if (user) {
        if (user.password) user.password = "removed";
      }
    });
    res.json(data);
  } else {
    res.status(404).send();
  }
});

router.get("/:id", adminRequired, async (req, res) => {
  try {
    userData = await User.findOne({ id: req.params.id });
  } catch (err) {
    res.json({ error: err });
    return;
  }
  if (userData) {
    if (userData.password) userData.password = "removed";
    res.json(userData);
  } else {
    res.status(404).send();
  }
});

router.post("/create_custom", adminRequired, async (req, res) => {
  let user = req.body.user;
  if (!user) {
    res.status(500).json({
      error: "No user details",
    });
  }
  let dbUser = await User.findOne({
    $or: [
      { username: user.username },
      { email: user.email },
      { title: user.username },
    ],
  });
  if (dbUser) {
    res.status(409).json({
      error: "User exists, please change the username or email",
    });
    return;
  } else {
    try {
      let newUser = new User({
        id: user.id,
        title: user.username,
        username: user.username,
        email: user.email,
        recommendationsPlaylistId: false,
        thumb: false,
        password: bcrypt.hashSync(user.password, 10),
        altId: user.linked,
        custom: true,
      });
      await newUser.save();
      res.status(200).json(newUser);
    } catch (err) {
      logger.log("error", "ROUTE: Unable to create custom user");
      logger.error(err.stack);
      res.status(500).json({
        error: "Error creating user",
      });
    }
  }
});

router.post("/edit", adminRequired, async (req, res) => {
  let user = req.body.user;
  if (!user) {
    res.status(500).json({
      error: "No user details",
    });
  }
  try {
    await User.findOneAndUpdate(
      { _id: user.id },
      {
        $set: {
          email: user.email,
          role: user.role,
          profile: user.profile,
          disabled: user.disabled,
        },
      },
      { new: true, useFindAndModify: false }
    );

    res.json({
      message: "User edited",
    });
  } catch {
    res.status(500).json({
      error: "Error editing user",
    });
  }
});

router.post("/bulk_edit", adminRequired, async (req, res) => {
  let users = req.body.users;
  let enabled = req.body.enabled;
  let profile = req.body.profile;

  if (!users) {
    res.status(500).json({
      error: "No user details",
    });
    return;
  }

  try {
    await Promise.all(
      users.map(async (user) => {
        await User.updateMany(
          {
            _id: user,
          },
          {
            $set: {
              profile: profile,
              disabled: enabled ? false : true,
            },
          }
        );
      })
    );
    res.json({
      message: "Users saved",
    });
  } catch {
    res.status(500).json({
      error: "Error editing user",
    });
  }
});

router.post("/delete_user", adminRequired, async (req, res) => {
  let user = req.body.user;
  if (!user) {
    res.status(500).json({
      error: "No user details",
    });
    return;
  }

  if (!user.custom) {
    res.status(401).json({
      error: "Cannot delete non custom users",
    });
    return;
  }

  try {
    await User.findByIdAndDelete(user._id);
    res.json({
      message: "User deleted",
    });
  } catch {
    res.status(500).json({
      error: "Error deleting user",
    });
  }
});

module.exports = router;
