import express from "express";
import http from "follow-redirects";
import bcrypt from "bcryptjs";
import multer from "multer";
import fs from "fs";
import path from "path";

import { UserModel, UserRole } from "../models/user";
import Profile from "../models/profile";
import logger from "../app/logger";
import { adminRequired, authRequired } from "../middleware/auth";
import { conf, WriteConfig } from "../app/config";
import { dataFolder } from "../app/env";

const router = express.Router();

const UPLOAD_DIR = path.join(dataFolder, "./uploads");

router.get("/thumb/:id", async (req, res) => {
  let userData: any = false;
  try {
    userData = await UserModel.findOne({ id: req.params.id });
  } catch (err) {
    res.json({ error: err });
    return;
  }

  if (userData) {
    if (userData.custom_thumb) {
      res.sendFile(`${UPLOAD_DIR}/${userData.custom_thumb}`);
      return;
    }
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

router.get("/quota", authRequired, async (req: any, res) => {
  if (!req.jwtUser) {
    res.sendStatus(404);
    return;
  }
  const user = await UserModel.findOne({ id: req.jwtUser.id });
  if (!user) {
    return;
  }

  if (!user) {
    res.sendStatus(404);
    return;
  }
  const profile = user.profileId
    ? await Profile.findById(user.profileId)
    : false;
  let total = 0;
  let current = user.quotaCount ? user.quotaCount : 0;
  if (profile) {
    total = profile.quota ? profile.quota : 0;
  }
  res.json({
    current: current,
    total: total,
  });
});

router.use(authRequired);

router.get("/all", adminRequired, async (req, res) => {
  let userData: any;
  try {
    userData = await UserModel.find();
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
  let userData: any;
  try {
    userData = await UserModel.findOne({ id: req.params.id });
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
  let dbUser = await UserModel.findOne({
    $or: [
      { username: user.username },
      { email: user.email },
      { title: user.username },
    ],
  });
  if (dbUser) {
    res.status(200).json({
      error: "User exists, please change the username or email",
    });
    return;
  } else {
    try {
      let newUser = new UserModel({
        id: user.id,
        title: user.username,
        username: user.username,
        password: bcrypt.hashSync(user.password, 12),
        email: user.email,
        recommendationsPlaylistId: false,
        thumbnail: "",
        altId: user.linked,
        isOwner: false,
      });
      await newUser.save();
      res.status(200).json(newUser);
    } catch (err) {
      logger.log("error", "ROUTE: Unable to create custom user");
      logger.log({ level: "error", message: err });
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
    let userObj: any = {
      email: user.email,
      role: user.role,
      profile: user.profile,
      disabled: user.disabled,
    };

    if (user.password) {
      userObj.password = bcrypt.hashSync(user.password, 10);
    }

    if (user.clearPassword) {
      userObj.password = null;
    }

    if (user.role === UserRole.Admin && !user.password) {
      userObj.password =
        conf.get("admin.password").substring(0, 3) === "$2a"
          ? conf.get("admin.password")
          : bcrypt.hashSync(conf.get("admin.password"), 10);
    }

    if (user.role === "admin" && user.email) {
      conf.set("admin.email", user.email);
      WriteConfig();
    }

    await UserModel.findOneAndUpdate(
      { _id: user.id },
      {
        $set: userObj,
      },
      { new: true, useFindAndModify: false }
    );

    res.json({
      message: "User edited",
    });
  } catch (err) {
    logger.log({ level: "error", message: err });
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
        await UserModel.updateMany(
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
    await UserModel.findByIdAndDelete(user._id);
    res.json({
      message: "User deleted",
    });
  } catch {
    res.status(500).json({
      error: "Error deleting user",
    });
  }
});

let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    req.newThumb =
      file.fieldname + "-" + Date.now() + path.extname(file.originalname);
    cb(null, req.newThumb);
  },
});

router.use((req, res, next) => {
  if (fs.existsSync(UPLOAD_DIR)) {
    next();
    return;
  }
  logger.info("ROUTE: Creating upload dir");
  fs.mkdirSync(UPLOAD_DIR);
  logger.info("ROUTE: Upload dir created");
  next();
});

var upload = multer({ storage }).single("thumb");

router.use((req, res, next) => {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      logger.log({ level: "error", message: err });
      logger.warn("ROUTE: A Multer error occurred when uploading.");
      res.sendStatus(500);
      return;
    } else if (err) {
      logger.log({ level: "error", message: err });
      logger.warn("ROUTE: An unknown error occurred when uploading.");
      res.sendStatus(500);
      return;
    }
    logger.verbose("ROUTE: Multer image parsed");
    next();
  });
});

router.post("/thumb/:id", adminRequired, async (req: any, res) => {
  if (!req.params.id) {
    logger.warn("ROUTE: No user ID");
    res.sendStatus(400);
    return;
  }
  try {
    await UserModel.findOneAndUpdate(
      { id: req.params.id },
      {
        $set: {
          custom_thumb: req.newThumb,
        },
      },
      { useFindAndModify: false }
    );
    res.sendStatus(200);
  } catch (err) {
    logger.log({ level: "error", message: err });
    logger.warn("ROUTE: Failed to update user thumb in db");
    res.sendStatus(500);
  }
});

export default router;
