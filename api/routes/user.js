const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Admin = require("../models/admin");
const http = require("follow-redirects").http;

router.get("/thumb/:id", async (req, res) => {
  let userData = false;
  try {
    userData = await User.findOne({ id: req.params.id });
  } catch (err) {
    res.json({ error: err });
    return;
  }
  if (!userData) {
    try {
      userData = await Admin.findOne({ id: req.params.id });
    } catch (err) {
      res.json({ error: err });
      return;
    }
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
        console.log("Got error: " + e.message, e);
      });
    request.end();
  }
});

router.get("/all", async (req, res) => {
  try {
    userData = await User.find();
    adminData = await Admin.find();
  } catch (err) {
    res.json({ error: err });
    return;
  }

  if (userData) {
    let data = Object.values(Object.assign(userData, adminData));
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

router.get("/:id", async (req, res) => {
  try {
    userData = await User.findOne({ id: req.params.id });
  } catch (err) {
    res.json({ error: err });
    return;
  }
  if (!userData) {
    try {
      userData = await Admin.findOne({ id: req.params.id });
    } catch (err) {
      res.json({ error: err });
      return;
    }
  }
  if (userData) {
    if (userData.password) userData.password = "removed";
    res.json(userData);
  } else {
    res.status(404).send();
  }
});

router.post("/create_custom", async (req, res) => {
  let user = req.body.user;
  if (!user) {
    res.status(500).json({
      error: "No user details",
    });
  }
  let friend = await User.findOne({
    $or: [{ username: user.username }, { email: user.email }, { title: user.username }],
  });
  let admin = await Admin.findOne({
    $or: [{ username: user.username }, { email: user.email }, { title: user.username }],
  });
  if (friend || admin) {
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
        password: user.password,
        altId: user.linked,
        custom: true,
      });
      await newUser.save();
      res.status(200).json(newUser);
    } catch (err) {
      console.log(err);
      res.status(500).json({
        error: "Error creating user",
      });
    }
  }
});

router.post("/edit", async (req, res) => {
  let user = req.body.user;
  if (!user) {
    res.status(500).json({
      error: "No user details",
    });
  }
  try {
    if (user.role === "admin") {
      await Admin.findOneAndUpdate(
        { _id: user.id },
        {
          $set: {
            email: user.email,
            profile: user.profile,
            disabled: user.disabled,
          },
        },
        { new: true, useFindAndModify: false }
      );
    } else {
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
    }
    res.json({
      message: "User edited",
    });
  } catch {
    res.status(500).json({
      error: "Error editing user",
    });
  }
});

router.post("/bulk_edit", async (req, res) => {
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
        await Admin.updateMany(
          {
            _id: user,
          },
          {
            $set: {
              profile: profile,
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

router.post("/delete_user", async (req, res) => {
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
