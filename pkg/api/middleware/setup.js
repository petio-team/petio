const { conf } = require('../util/config');

const checkSetup = (req, res, next) => {
    if (conf.get('admin.id') == null) {
        const path = req.path;
        if (path.startsWith("/api")) {
            if (
                path !== "/" &&
                !path.includes("/api/setup") &&
                path !== "/api/config"
            ) {
                res.status(401).send("You need to complete setup to access this url");
                return;
            }
        }
    }
    next();
};

module.exports = checkSetup;