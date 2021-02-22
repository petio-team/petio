const express = require("express");
const router = express.Router();
const Issue = require("../models/issue");
const logger = require("../util/logger");
const Mailer = require("../mail/mailer");
const User = require("../models/user");
const { movieLookup } = require("../tmdb/movie");
const { showLookup } = require("../tmdb/show");

router.post("/add", async (req, res) => {
  const newIssue = new Issue({
    mediaId: req.body.mediaId,
    type: req.body.type,
    title: req.body.title,
    user: req.body.user,
    sonarrId: false,
    radarrId: false,
    issue: req.body.issue,
    comment: req.body.comment,
  });

  try {
    const savedIssue = await newIssue.save();
    mailIssue(req.body.user, req.body.mediaId, req.body.type, req.body.title);
    res.json(savedIssue);
  } catch (err) {
    console.log(err);
    logger.log("warn", "ROUTE: Error addding issue");
    logger.log("error", err.stack);
    res.status(500).json({ error: "Error adding issue" });
  }
});

router.post("/remove", async (req, res) => {
  const issue_id = req.body.id;
  const message = req.body.message;

  try {
    let issue = await Issue.findById(issue_id);
    mailIssueResolve(
      issue.user,
      issue.mediaId,
      issue.type,
      issue.title,
      message
    );
    await Issue.findByIdAndDelete(issue_id);
    res.status(200).send();
  } catch (err) {
    console.log(err);
    logger.log("warn", "ROUTE: Error removing issue");
    logger.log("error", err.stack);
    res.status(500).json({ error: "Error removing issue" });
  }
});

router.get("/all", async (req, res) => {
  const issues = await Issue.find();
  res.json(issues);
});

async function mailIssue(user_id, media_id, type, title) {
  let userData = await User.findOne({ id: user_id });
  let media = false;
  if (type === "tv") {
    media = await showLookup(media_id, true);
  } else {
    media = await movieLookup(media_id, true);
  }
  if (!media) {
    logger.log("warn", "MAILER: Media not found");
    return;
  }
  if (!userData) {
    logger.log("warn", "MAILER: User not found");
    return;
  }
  if (!userData.email) {
    logger.log("warn", "MAILER: No user email");
    return;
  }
  let typeF = type === "tv" ? "TV Show" : "Movie";
  new Mailer().mail(
    `Issue reported for the ${type} ${title}`,
    `Issue reported for ${typeF}: ${title}`,
    `Your issue has been logged and you'll receive another email once it has been addressed`,
    `https://image.tmdb.org/t/p/w500${media.poster_path}`,
    [userData.email],
    [userData.title]
  );
}

async function mailIssueResolve(user_id, media_id, type, title, message) {
  let userData = await User.findOne({ id: user_id });
  let media = false;
  if (type === "tv") {
    media = await showLookup(media_id, true);
  } else {
    media = await movieLookup(media_id, true);
  }
  if (!media) {
    logger.log("warn", "MAILER: Media not found");
    return;
  }
  if (!userData) {
    logger.log("warn", "MAILER: User not found");
    return;
  }
  if (!userData.email) {
    logger.log("warn", "MAILER: No user email");
    return;
  }
  let typeF = type === "tv" ? "TV Show" : "Movie";
  new Mailer().mail(
    `Issue closed for the ${type} ${title}`,
    `Issue closed for ${typeF}: ${title}`,
    `The issue you reported has now been closed. ${message}`,
    `https://image.tmdb.org/t/p/w500${media.poster_path}`,
    [userData.email],
    [userData.title]
  );
}

module.exports = router;
