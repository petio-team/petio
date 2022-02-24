import express from "express";

import logger from "../app/logger";
import Discord from "../notifications/discord";
import Telegram from "../notifications/telegram";

const router = express.Router();

router.get("/discord/test", async (req, res) => {
  let test = await new Discord().test();
  res.json({ result: test.result, error: test.error });
});

router.get("/telegram/test", async (req, res) => {
  let test = await new Telegram().test();
  res.json({ result: test.result, error: test.error });
});

export default router;
