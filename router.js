const express = require("express");
const router = express();
const path = require("path");
const { createProxyMiddleware } = require("http-proxy-middleware");

const adminPath = process.pkg ? path.join(path.dirname(process.execPath), "./views/admin") : path.join(__dirname, "./views/admin");
router.use("/admin/", express.static(adminPath));

const fePath = process.pkg ? path.join(path.dirname(process.execPath), "./views/frontend") : path.join(__dirname, "./views/frontend");
router.use("/", express.static(fePath));

router.use(
  "/api",
  createProxyMiddleware({
    target: "http://localhost:7778",
    pathRewrite: function (path, req) {
      if (req.basePath !== "/") {
        return path.replace("//", "/").replace(`${req.basePath}/api/`, "/");
      } else {
        return path.replace("/api/", "/");
      }
    },
  })
);

router.get("*", function (req, res) {
  res.status(404).send(`Petio Router: not found - ${req.path}`);
});

module.exports = router;
