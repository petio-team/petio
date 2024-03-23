const express = require("express");
const Invitation = require("../models/invitation");
const logger = require("../util/logger");
const Libraries = require("../models/library");
const User = require("../models/user");
const addUserToPlexServer = require("../plex/invitations");
const getConfig = require("../util/config");
const updateConfig = require("../util/updateConfig");

const adminInvitationRouter = express.Router();
const userInvitationRouter = express.Router();

async function formatInvitation(invitation) {
  const libraries = await Libraries.find();

  return {
    _id: invitation._id,
    invitCode: invitation.invitCode,
    email: invitation.email,
    invitedBy: await User.findById(invitation.invitedBy),
    acceptedBy: await Promise.all(
      invitation.acceptedBy.map(async (id) => User.findById(id))
    ),
    maxUses: invitation.maxUses,
    used: invitation.used,
    invitedOn: invitation.invitedOn,
    expireOn: invitation.expireOn,
    libraries: invitation.libraries
      .map((id) => libraries.find((lib) => lib.uuid === id))
      .filter(Boolean),
    downloadPermitted: invitation.downloadPermitted,
  };
}

adminInvitationRouter.get("/", async (req, res) => {
  try {
    const invitations = await Invitation.find();

    const completeInvitations = await Promise.all(
      invitations.map(formatInvitation)
    );

    res.status(200).json(completeInvitations);
  } catch (err) {
    res
      .status(500)
      .json({ level: "error", message: "Failed to get invitations" });
    return;
  }
});

adminInvitationRouter.put("/", async (req, res) => {
  const invitation = req.body;

  if (!invitation) {
    res.status(403).json({ error: "No invitation details" });
    return;
  }

  const {
    invitCode,
    invitedBy,
    expireOn,
    libraries,
    maxUses,
    downloadPermitted,
    email,
  } = invitation;

  try {
    if (!invitCode || !invitedBy) {
      res.status(403).json({ error: "Missing required fields" });
      return;
    }

    const newInvitation = new Invitation({
      invitCode,
      invitedBy,
      email,
      acceptedBy: [],
      maxUses,
      used: 0,
      invitedOn: new Date(),
      expireOn,
      libraries: libraries || [],
      downloadPermitted: !!downloadPermitted,
    });

    await newInvitation.save();
    res.status(200).json(await formatInvitation(newInvitation));
  } catch (err) {
    logger.log("error", "ROUTE: Invitation failed to save");
    logger.log({ level: "error", message: err });
    res.status(500).json({ error: "Error creating invitation" });
  }
});

adminInvitationRouter.post("/", async (req, res) => {
  const invitation = req.body;

  if (!invitation || !invitation._id) {
    res.status(403).json({ error: "No invitation details" });
    return;
  }

  try {
    const updatedInvitation = await Invitation.findOneAndUpdate(
      { _id: invitation._id },
      {
        expireOn: invitation.expireOn,
        maxUses: invitation.maxUses,
        email: invitation.email,
        libraries: invitation.libraries,
        downloadPermitted: invitation.downloadPermitted,
      },
      { new: true }
    );

    res.status(200).json(await formatInvitation(updatedInvitation));
    return;
  } catch {
    res.status(500).json({ error: "Failed to update" });
  }
});

adminInvitationRouter.get("/redirectUrl", async (req, res) => {
  try {
    const config = getConfig();
    console.log(config);
    res.status(200).json({ urlRedirection: config.redirectUrlAfterInvite });
  } catch {
    res.status(500).json({ error: "Failed to get URL redirection" });
  }
});

adminInvitationRouter.post("/redirectUrl", async (req, res) => {
  let { urlRedirection } = req.body;
  if (!urlRedirection) {
    urlRedirection = "https://app.plex.tv/desktop/#!/";
  }

  try {
    updateConfig("redirectUrlAfterInvite", urlRedirection);
    res.status(200).json({ urlRedirection });
  } catch {
    res.status(500).json({ error: "Failed to update URL redirection" });
  }
});

adminInvitationRouter.post("/delete", async (req, res) => {
  const { id } = req.body;
  if (!id) {
    res.status(403).json({ error: "Invitation id not valid" });
    return;
  }

  try {
    await Invitation.findOneAndDelete({ _id: id });
    res.status(200).json({ message: "Invitation deleted" });
  } catch {
    res.status(500).json({ error: "Failed to delete" });
  }
});

adminInvitationRouter.get("/libraries", async (req, res) => {
  try {
    const libraries = await Libraries.find();
    res.status(200).json(libraries || []);
  } catch (err) {
    res.status(500).json({ error: err });
    return;
  }
});

userInvitationRouter.post("/accept", async (req, res) => {
  const { invitCode, plexUser } = req.body;

  if (!invitCode) {
    res.status(500).json({ error: "No invitation code provided." });
    return;
  }

  if (!plexUser) {
    res.status(500).json({ error: "Failed to load user datas." });
    return;
  }

  let invitation;
  try {
    invitation = await Invitation.findOne({ invitCode });
  } catch (err) {
    logger.log("error", "ROUTE: Invitation failed to get");
    logger.log({ level: "error", message: err });
  }

  if (!invitation) {
    res.status(404).json({ level: "error", message: "Wrong invitation code." });
    return;
  }

  if (typeof invitation.maxUses && invitation.used >= invitation.maxUses) {
    res.status(403).json({
      level: "error",
      message: "Invitation code has been used up. Please ask another code.",
    });
    return;
  }

  if (invitation.expireOn < new Date()) {
    res.status(403).json({
      level: "error",
      message: "Invitation code has expired. Please ask another code.",
    });
    return;
  }

  if (invitation.email && invitation.email !== plexUser.user.email) {
    res.status(403).json({
      level: "error",
      message:
        "You can't use this invitation code with this email. Use the one in the invitation.",
    });
    return;
  }

  try {
    await addUserToPlexServer(invitation, plexUser);
  } catch (err) {
    logger.log({ level: "error", message: err.message });
    res.status(400).json({ level: "error", message: err.message });
    return;
  }

  try {
    await Invitation.findOneAndUpdate({ _id: invitation._id }, invitation);
    const config = getConfig();

    res.status(200).json({
      redirectUrl: config.redirectUrlAfterInvite,
    });
  } catch (err) {
    logger.log("error", "ROUTE: Invitation failed to update");
    logger.log({ level: "error", message: err.message });
    res.status(400).json({ level: "error", message: err.message });
  }
});

userInvitationRouter.get("/:code", async (req, res) => {
  const { code } = req.params;
  try {
    const invitation = await Invitation.findOne({ invitCode: code });
    if (invitation) {
      if (new Date(invitation.expireOn) < new Date()) {
        res.status(400).json({
          valid: false,
          message: "Invitation expired, please ask a new code.",
        });
        return;
      } else if (invitation.maxUses && invitation.used >= invitation.maxUses) {
        res
          .status(400)
          .json({ valid: false, message: "Invitation code has been used up." });
        return;
      } else {
        res.status(200).json({
          valid: true,
          invitation: await formatInvitation(invitation),
        });
        return;
      }
    }
    res
      .status(404)
      .json({ valid: false, message: "Invitation code not found." });
  } catch (err) {
    res.status(500).json({ error: err });
    return;
  }
});

module.exports = {
  adminInvitationRouter,
  userInvitationRouter,
};
