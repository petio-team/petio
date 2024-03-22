const express = require("express");
const adminInvitationRouter = express.Router();
const userInvitationRouter = express.Router();
const Invitation = require("../models/invitation");
const logger = require("../util/logger");
const LibraryUpdate = require("../plex/libraryUpdate");
const User = require("../models/user");

async function formatInvitation(invitation, libraries) {
  return {
    _id: invitation._id,
    inviteCode: invitation.inviteCode,
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
    const libraries =
      (await new LibraryUpdate().getLibraries()).Directory || [];
    const invitations = await Invitation.find();
    const completeInvitations = await Promise.all(
      invitations.map((inv) => formatInvitation(inv, libraries))
    );

    res.status(200).json(completeInvitations);
  } catch (err) {
    res.status(500).json({ error: err });
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
    inviteCode,
    invitedBy,
    expireOn,
    libraries,
    maxUses,
    downloadPermitted,
    email,
  } = invitation;

  try {
    if (!inviteCode || !invitedBy) {
      res.status(403).json({ error: "Missing required fields" });
      return;
    }

    const newInvitation = new Invitation({
      inviteCode,
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
    res.status(200).json(newInvitation);
  } catch (err) {
    logger.log("error", "ROUTE: Invitation failed to save");
    logger.log({ level: "error", message: err });
    res.status(500).json({ error: "Error creating invitation" });
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
        $set: {
          expireOn: invitation.expireOn,
          maxUses: invitation.maxUses,
          email: invitation.email,
          libraries: invitation.libraries,
          downloadPermitted: invitation.downloadPermitted,
        },
      },
      { useFindAndModify: false }
    );

    const libraries =
      (await new LibraryUpdate().getLibraries()).Directory || [];
    res
      .status(200)
      .json(
        await formatInvitation(
          { ...updatedInvitation._doc, ...invitation },
          libraries
        )
      );
    return;
  } catch {
    res.status(500).json({ error: "Failed to update" });
  }
});

adminInvitationRouter.get("/libraries", async (req, res) => {
  try {
    const plexLibraries = await new LibraryUpdate().getLibraries();
    res.status(200).json(plexLibraries.Directory || []);
  } catch (err) {
    res.status(500).json({ error: err });
    return;
  }
});

userInvitationRouter.post("/accept", async (req, res) => {
  const { inviteCode, acceptedBy } = req.body;

  if (!inviteCode) {
    res.status(500).json({ error: "No invitation code provided." });
    return;
  }

  let invitation;
  try {
    invitation = await Invitation.findOne({ inviteCode });
  } catch (err) {
    logger.log("error", "ROUTE: Invitation failed to get");
    logger.log({ level: "error", message: err });
  }

  if (!invitation) {
    res.status(404).json({ error: "Wrong invitation code." });
    return;
  }

  if (
    typeof invitation.maxUses === "number" &&
    invitation.used < invitation.maxUses
  ) {
    res.status(403).json({ error: "Invitation code has been used up." });
    return;
  }

  if (invitation.expireOn < new Date()) {
    res.status(403).json({ error: "Invitation code has expired." });
    return;
  }

  try {
    await Invitation.findOneAndUpdate(invitation, {
      $set: {
        accepted: true,
        acceptedBy: [...invitation.acceptedBy, acceptedBy],
        used: invitation.used + 1,
      },
    });
  } catch (err) {
    logger.log("error", "ROUTE: Invitation failed to update");
    logger.log({ level: "error", message: err });
  }
});

module.exports = {
  adminInvitationRouter,
  userInvitationRouter,
};
