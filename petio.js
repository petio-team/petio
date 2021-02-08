const express = require("express");
const path = require("path");
const app = express();
const API = require("./api/app");
const router = require("./router");
const fs = require("fs");

class Wrapper {
  // Start Main Wrapper
  async getBase() {
    try {
      let config = require("./api/config/config.json");
      if (config.base_path) {
        return config.base_path;
      } else {
        return "/";
      }
    } catch (err) {
      console.log(err);
      return "/";
    }
  }

  async init() {
    try {
      let basePath = await this.getBase();
      console.log(`ROUTER: Base path found - ${basePath}`);
      app.use((req, res, next) => {
        req.basePath = basePath;
        next();
      });
      app.use(basePath, router);
      app.listen(7777);
    } catch (err) {
      console.log(err);
    }
  }

  // Catch 404s at main router level
  notfound() {
    app.get("*", function (req, res) {
      res.status(404).send(`Petio Router: not found - ${req.path}`);
    });
  }
}

const wrapper = new Wrapper();
wrapper.init();
