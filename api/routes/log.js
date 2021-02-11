const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const logger = require("../util/logger");

let liveLogfile = process.pkg
  ? path.join(path.dirname(process.execPath), "./logs/live1.log")
  : "./logs/live1.log";
let liveLogfile2 = process.pkg
  ? path.join(path.dirname(process.execPath), "./logs/live.log")
  : "./logs/live.log";

router.get("/stream", async (req, res) => {
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

  // data.sort();

  // } catch (err) {
  //   console.log(err);
  //   logger.log("error", "ROUTE: Unable to get logs");
  // }
});

module.exports = router;
