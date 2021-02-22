// Config

const express = require("express");
const router = express.Router();
const Issue = require("../models/issue");
const logger = require("../util/logger");

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
    res.json(savedIssue);
  } catch (err) {
    logger.log("warn", "ROUTE: Error addding issue");
    logger.log("info", err);
    res.status(500).json({ error: "error adding issue" });
  }
});

router.get("/all", async (req, res) => {
  const issues = await Issue.find();
  res.json(issues);
});

module.exports = router;
