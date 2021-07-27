import express from "express";
const router = express.Router();
import trending from "../tmdb/trending";

router.get("/", async (req, res) => {
  let data = await trending();
  res.json(data);
});

export default router;
