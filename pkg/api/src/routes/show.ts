import express from "express";

import { showLookup, discoverSeries, network } from "../tmdb/show";

const router = express.Router();

router.get("/lookup/:id", async (req, res) => {
  let data = await showLookup(req.params.id, false);
  res.json(data);
});

router.get("/lookup/:id/minified", async (req, res) => {
  let data = await showLookup(req.params.id, true);
  res.json(data);
});

router.post("/discover", async (req, res) => {
  let page = req.body.page ? req.body.page : 1;
  let params = req.body.params;
  let data = await discoverSeries(page, params);
  res.json(data);
});

router.get("/network/:id", async (req, res) => {
  let data = await network(req.params.id);
  res.json(data);
});

export default router;
