const express = require("express");
const router = express();
const path = require("path");
const { createProxyMiddleware } = require("http-proxy-middleware");
const logger = require("./api/util/logger");

const adminPath = process.pkg
	? path.join(path.dirname(process.execPath), "./views/admin")
	: path.join(__dirname, "./views/admin");
logger.log("verbose", `ROUTER: Serving admin route to ${adminPath}`);
router.use("/admin", express.static(adminPath));

const fePath = process.pkg
	? path.join(path.dirname(process.execPath), "./views/frontend")
	: path.join(__dirname, "./views/frontend");
logger.log("verbose", `ROUTER: Serving frontend route to ${fePath}`);
router.use("/", express.static(fePath));

router.use(
	"/api",
	createProxyMiddleware({
		target: "http://localhost:7778",
		pathRewrite: function (path, req) {
			if (req.basePath !== "/") {
				return path
					.replace("//", "/")
					.replace(`${req.basePath}/api/`, "/");
			} else {
				return path.replace("/api/", "/");
			}
		},
	})
);
logger.log("verbose", `ROUTER: API proxy setup - Proxying /api -> /`);

router.get("*", function (req, res) {
	logger.log(
		"warn",
		`ROUTER: Not found - ${req.path} | IP: ${
			req.headers["x-forwarded-for"] || req.connection.remoteAddress
		}`
	);
	res.status(404).send(`Petio Router: not found - ${req.path}`);
});

module.exports = router;
