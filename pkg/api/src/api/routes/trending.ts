import { Router } from "express";

import trending from "@/tmdb/trending";
import { authRequired } from "@/api/middleware/auth";

const route = Router();

export default (app: Router) => {
  app.use("/trending", route);
  route.use(authRequired);

  route.get("/", async (_req, res) => {
    let data = await trending();
    res.json(data);
  });
};
