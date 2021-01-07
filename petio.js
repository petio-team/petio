const express = require("express");
const path = require("path");
const app = express();
const open = require("open");
const API = require("./api/app");
const { createProxyMiddleware } = require("http-proxy-middleware");

class Wrapper {
  init() {
    console.log("running");
    this.admin();
    this.user();
    this.api();
    app.listen(7777);
    // open("http://localhost:7777/admin/");
  }

  api() {
    app.use(
      "/api",
      createProxyMiddleware({
        target: "http://localhost:7778",
        pathRewrite: {
          "^/api/": "/", // remove base path
        },
      })
    );
  }

  admin() {
    const adminPath = process.pkg ? path.join(path.dirname(process.execPath), "./views/admin") : "./views/admin";
    app.use("/admin/", express.static(adminPath));
  }

  user() {
    const fePath = process.pkg ? path.join(path.dirname(process.execPath), "./views/frontend") : "./views/frontend";
    app.use("/", express.static(fePath));
  }
}

const wrapper = new Wrapper();
wrapper.init();
