import { Router } from "express";
import { movieLookup, discoverMovie, company } from "@/tmdb/movie";
import { authRequired } from "@/api/middleware/auth";

const route = Router();

export default (app: Router) => {
  app.use("/movie", route);
  route.use(authRequired);

  route.get("/lookup/:id", async (req, res) => {
    let data = await movieLookup(req.params.id);
    res.json(data);
  });

  route.get("/lookup/:id/minified", async (req, res) => {
    let data = await movieLookup(req.params.id, true);
    res.json(data);
  });

  route.post("/discover", async (req, res) => {
    let page = req.body.page ? req.body.page : 1;
    let params = req.body.params;
    let data = await discoverMovie(page, params);
    res.json(data);
  });

  route.get("/company/:id", async (req, res) => {
    let data = await company(req.params.id);
    res.json(data);
  });
};
