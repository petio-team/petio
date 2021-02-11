const User = require("../models/user");
const logger = require("../util/logger");

class QuotaSystem {
  async reset() {
    logger.log("info", "QUOTA: Reseting Quotas");
    await User.updateMany({}, { $set: { quotaCount: 0 } });
  }
}

module.exports = QuotaSystem;
