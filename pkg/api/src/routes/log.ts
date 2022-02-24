import express from "express";
import fs from "fs";
import path from "path";
import { adminRequired  } from "../middleware/auth";
import { dataFolder } from "../app/env";

const router = express.Router();

let liveLogfile = path.join(dataFolder, "./logs/live1.log");
let liveLogfile2 = path.join(dataFolder, "./logs/live.log");

router.use(adminRequired);
router.get("/stream", adminRequired, async (req, res) => {
  let dataNew, dataOld;
  try {
    let logsNew = fs.readFileSync(liveLogfile, "utf8");
    dataNew = JSON.parse(`[${logsNew.replace(/,\s*$/, "")}]`);
  } catch {
    dataNew = [];
  }

  try {
    let logsOld = fs.readFileSync(liveLogfile2, "utf8");
    dataOld = JSON.parse(`[${logsOld.replace(/,\s*$/, "")}]`);
  } catch {
    dataOld = [];
  }

  let data = [...dataNew, ...dataOld];
  res.json(data);
});

export default router;
