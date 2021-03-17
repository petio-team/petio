const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const { adminRequired } = require("../middleware/auth");

let liveLogfile = process.pkg
  ? path.join(path.dirname(process.execPath), "./logs/live1.log")
  : "./logs/live1.log";
let liveLogfile2 = process.pkg
  ? path.join(path.dirname(process.execPath), "./logs/live.log")
  : "./logs/live.log";

router.use(adminRequired);
router.get("/stream", adminRequired, async (req, res) => {
  // res.status(200).send();
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

module.exports = router;
