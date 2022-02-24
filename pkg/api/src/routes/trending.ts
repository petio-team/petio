import express from "express";
import trending from "../tmdb/trending";

const router = express.Router();

router.get("/", async (req, res) => {
  let data = await trending();
  res.json(data);
});

export default router;
