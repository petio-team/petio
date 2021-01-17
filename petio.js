const express = require("express");
const path = require("path");
const app = express();
const open = require("open");
const API = require("./api/app");
const { createProxyMiddleware } = require("http-proxy-middleware");

class Wrapper {
  // Start Main Wrapper
  init() {
    console.log("Starting Petio");
    this.admin();
    this.user();
    this.api();
    this.notfound();
    app.listen(7777);
  }

  // Proxy API on port 7778 internally
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

  // Serve Admin files
  admin() {
    const adminPath = process.pkg ? path.join(path.dirname(process.execPath), "./views/admin") : path.join(__dirname, "./views/admin");
    app.use("/admin/", express.static(adminPath));
  }

  // Server user frontend files
  user() {
    const fePath = process.pkg ? path.join(path.dirname(process.execPath), "./views/frontend") : path.join(__dirname, "./views/frontend");
    app.use("/", express.static(fePath));
  }

  // Catch 404s at main router level
  notfound() {
    app.get("*", function (req, res) {
      res.status(404).send("Petio Router: not found");
    });
  }
}

const wrapper = new Wrapper();
wrapper.init();
