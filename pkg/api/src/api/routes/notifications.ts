import { Router } from "express";

import { authRequired } from "@/api/middleware/auth";
import Discord from "@/notifications/discord";
import Telegram from "@/notifications/telegram";

const route = Router();

export default (app: Router) => {
  app.use("/hooks", route);
  route.use(authRequired);

  route.get("/discord/test", async (_req, res) => {
    let test = await new Discord().test();
    res.json({ result: test.result, error: test.error });
  });

  route.get("/telegram/test", async (_req, res) => {
    let test = await new Telegram().test();
    res.json({ result: test.result, error: test.error });
  });
};
