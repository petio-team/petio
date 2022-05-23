import { Router } from "express";
import fs from "fs";
import path from "path";

import { adminRequired } from "@/api/middleware/auth";
import { dataFolder } from "@/config/env";

let liveLogfile = path.join(dataFolder, "./logs/live1.log");
let liveLogfile2 = path.join(dataFolder, "./logs/live.log");

const route = Router();

export default (app: Router) => {
  app.use("/log", route);
  route.use(adminRequired);

  route.get("/stream", adminRequired, async (_req, res) => {
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
};
