const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

const logger = require("../app/logger");
const testConnection = require('../plex/testConnection');
const bcrypt = require("bcryptjs");
const { WriteConfig, conf } = require("../app/config");

router.post("/test_server", async (req, res) => {
    let server = req.body.server;
    if (!server) {
        logger.log("warn", "Test Server bad request");
        res.status(400).send("Bad Request");
        return;
    }
    logger.log(
        "verbose",
        `Testing Server ${server.protocol}://${server.host}:${server.port}?X-Plex-Token=${server.token}`
    );
    try {
        let test = await testConnection(
            server.protocol,
            server.host,
            server.port,
            server.token
        );
        let status = test !== 200 ? "failed" : "connected";
        res.status(200).json({
            status: status,
            code: test,
        });
        logger.log(
            "verbose",
            `Test Server success - ${server.protocol}://${server.host}:${server.port}?X-Plex-Token=${server.token}`
        );
    } catch (err) {
        res.status(400).json({
            status: "failed",
            code: 400,
        });
        logger.log(
            "verbose",
            `Test Server failed - ${server.protocol}://${server.host}:${server.port}?X-Plex-Token=${server.token}`
        );
    }
});

router.post("/test_mongo", async (req, res) => {
    let mongo = req.body.mongo;
    logger.log("verbose", `testing mongo connection: ${mongo}`);
    if (!mongo) {
        res.status(400).send("Bad Request");
        logger.log("warn", "Mongo test bad request");
        return;
    }
    try {
        // Ensure no db is passed
        if (mongo.split("@").length > 1) {
            if (mongo.split("@")[1].split("/").length > 1) {
                res.status(401).json({
                    status: "failed",
                    error: "db path included",
                    tried: mongo,
                    l: mongo.split("@")[1].split("/").length,
                });
                logger.log("warn", "Mongo test db path included");
                return;
            }
        }
        logger.log("verbose", "Attempting mongo connection");
        await mongoose.connect(mongo + "/petio", {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            socketTimeoutMS: 100,
        });
        mongoose.connection.close();
        res.status(200).json({
            status: "connected",
        });
        logger.log("verbose", "Mongo test connection success");
    } catch (err) {
        res.status(401).json({
            status: "failed",
            error: err,
            tried: mongo,
        });
        logger.log("warn", "Mongo test connection failed");
    }
});

router.post("/set", async (req, res) => {
    logger.log("verbose", "Attempting to create config file");
    let user = req.body.user;
    let server = req.body.server;
    let db = req.body.db;
    if (!user || !server || !db) {
        res.status(500).send("Missing Fields");
        logger.log("warn", "Config creation missing fields");
        return;
    }

    conf.set('db.url', db + '/petio');
    conf.set('plex.protocol', server.protocol);
    conf.set('plex.host', server.host);
    conf.set('plex.port', server.port);
    conf.set('plex.token', server.token);
    conf.set('plex.client', server.clientId);
    conf.set('admin.username', user.username);
    conf.set('admin.email', user.email);
    conf.set('admin.password', bcrypt.hashSync(user.password, 10));
    conf.set('admin.id', user.id);
    conf.set('admin.thumbnail', user.thumb);
    conf.set('admin.display', user.username);

    try {
        WriteConfig();
        await WaitBeforeRestart(res);
    } catch (err) {
        res.status(500).send("Error Creating config");
        logger.log("error", "Config creation error");
        logger.log({ level: "error", message: err });
    }
    return;
});

const WaitBeforeRestart = async (res) => {
    setTimeout(() => {
        res.app.settings['restart']();
    }, 1000);
};

module.exports = router;