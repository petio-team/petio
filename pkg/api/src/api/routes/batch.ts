import { authRequired } from "@/api/middleware/auth";
import { Router } from "express";
import { movieLookup } from "../../tmdb/movie";
import { showLookup } from "../../tmdb/show";

const route = Router();

export default (app: Router) => {
  app.use("/batch", route);
  route.use(authRequired);

  route.post("/movie", async (req, res) => {
    const ids = req.body.ids;
    const min = req.body.min === undefined ? true : req.body.min;
    let output = await Promise.all(
      ids.map(async (id) => {
        if (!id) return;
        return movieLookup(id, min);
      })
    );
    res.json(output);
  });

  route.post("/tv", async (req, res) => {
    const ids = req.body.ids;
    const min = req.body.min === undefined ? true : req.body.min;
    let output = await Promise.all(
      ids.map(async (id) => {
        if (!id) return;
        return showLookup(id, min);
      })
    );
    res.json(output);
  });
};
