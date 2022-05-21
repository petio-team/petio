import { Router } from "express";

import logger from "@/loaders/logger";
import Profile from "@/models/profile";
import { UserModel } from "@/models/user";
import { adminRequired } from "@/api/middleware/auth";

const route = Router();

export default (app: Router) => {
  app.use("/profiles", route);
  route.use(adminRequired);

  route.get("/all", async (_req, res) => {
    let data: any;
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

  route.post("/save_profile", async (req, res) => {
    let profile = req.body.profile;
    if (!profile) {
      res.status(500).json({
        error: "No profile details",
      });
    }

    if (profile.isDefault) {
      try {
        await Profile.findOneAndUpdate(
          { isDefault: true },
          {
            $set: {
              isDefault: false,
            },
          },
          { new: true, useFindAndModify: false }
        );
      } catch {
        res.status(500).json({
          error: "Failed to update, error removing defaults",
        });
        return;
      }
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
              autoApproveTv: profile.autoApproveTv,
              quota: profile.quota,
              isDefault: profile.isDefault,
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
          autoApproveTv: profile.autoApproveTv,
          quota: profile.quota,
          isDefault: profile.isDefault,
        });
        await newProfile.save();
        res.status(200).json(newProfile);
      } catch (err) {
        logger.log("error", "ROUTE: Profile failed to save");
        logger.log({ level: "error", message: err });
        res.status(500).json({
          error: "Error creating user",
        });
      }
    }
  });

  route.post("/delete_profile", async (req, res) => {
    let profile = req.body.profile;
    if (!profile || !profile.id) {
      res.status(500).json({
        error: "No profile details",
      });
    }

    try {
      await UserModel.updateMany(
        {
          profileId: profile.id,
        },
        {
          $unset: {
            profile: "",
          },
        }
      );
    } catch (err) {
      logger.log("error", "ROUTE: Profile failed to delete");
      logger.log({ level: "error", message: err });
    }

    try {
      await Profile.findOneAndDelete({ _id: profile.id });
      res.status(200).json({
        message: "Profile deleted",
      });
    } catch {
      res.status(500).json({
        error: "Failed to delete",
      });
    }
  });
};
