const express = require("express");
const router = express.Router();
const logger = require("../util/logger");
const Discord = require("../notifications/discord");
const Telegram = require("../notifications/telegram");

router.get("/discord/test", async (req, res) => {
  let test = await new Discord().test();
  res.json({ result: test.result, error: test.error });
});

router.get("/telegram/test", async (req, res) => {
  let test = await new Telegram().test();
  res.json({ result: test.result, error: test.error });
});

module.exports = router;
