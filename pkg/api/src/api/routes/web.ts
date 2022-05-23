import express, { Router } from "express";
import path from "path";
import fs from "fs";

import { frontendView } from "@/config/env";
import { config } from "@/config/index";

const route = Router();

export default (app: Router) => {
  let frontendPath = path.resolve(frontendView);
  if (!fs.existsSync(path.join(frontendPath, "index.html"))) {
    const frontendBuildPath = path.join(frontendPath, "./build");
    if (!fs.existsSync(path.join(frontendBuildPath, "./index.html"))) {
      throw new Error("unable to find views files for frontend");
    } else {
      frontendPath = frontendBuildPath;
    }
  }
  route.use(express.static(frontendPath));

  if (config.get("petio.subpath") !== "/") {
    app.use(`${config.get("petio.subpath")}`, route);
  } else {
    app.use(`/`, route);
  }
};
