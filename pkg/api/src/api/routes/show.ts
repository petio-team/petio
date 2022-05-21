import { Router } from "express";

import { showLookup, discoverSeries, network } from "@/tmdb/show";
import { authRequired } from "@/api/middleware/auth";

const route = Router();

export default (app: Router) => {
  app.use("/show", route);
  route.use(authRequired);

  route.get("/lookup/:id", async (req, res) => {
    let data = await showLookup(req.params.id, false);
    res.json(data);
  });

  route.get("/lookup/:id/minified", async (req, res) => {
    let data = await showLookup(req.params.id, true);
    res.json(data);
  });

  route.post("/discover", async (req, res) => {
    let page = req.body.page ? req.body.page : 1;
    let params = req.body.params;
    let data = await discoverSeries(page, params);
    res.json(data);
  });

  route.get("/network/:id", async (req, res) => {
    let data = await network(req.params.id);
    res.json(data);
  });
};
