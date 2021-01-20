const express = require("express");
const router = express.Router();
const Profile = require("../models/profile");

router.get("/all", async (req, res) => {
  try {
    data = await Profile.find();
  } catch (err) {
    res.json({ error: err });
    return;
  }

  if (data) {
    res.json(data);
  } else {
    res.status(404).send();
  }
});

router.post("/save_profile", async (req, res) => {
  let profile = req.body.profile;
  if (!profile) {
    res.status(500).json({
      error: "No profile details",
    });
  }

  if (profile.id) {
    try {
      await Profile.findOneAndUpdate(
        { _id: profile.id },
        {
          $set: {
            name: profile.name,
            sonarr: profile.sonarr,
            radarr: profile.radarr,
            autoApprove: profile.autoApprove,
            quota: profile.quota,
          },
        },
        { new: true, useFindAndModify: false }
      );
      res.status(200).json({
        message: "Profile updated",
      });
    } catch {
      res.status(500).json({
        error: "Failed to update",
      });
    }
  } else {
    try {
      let newProfile = new Profile({
        name: profile.name,
        sonarr: profile.sonarr,
        radarr: profile.radarr,
        autoApprove: profile.autoApprove,
        quota: profile.quota,
      });
      await newProfile.save();
      res.status(200).json(newProfile);
    } catch (err) {
      console.log(err);
      res.status(500).json({
        error: "Error creating user",
      });
    }
  }
});

module.exports = router;
