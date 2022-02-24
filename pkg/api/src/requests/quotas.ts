const User = require("../models/user");
const logger = require("../app/logger");

export default class QuotaSystem {
  async reset() {
    logger.log("verbose", "QUOTA: Reseting Quotas");
    await User.updateMany({}, { $set: { quotaCount: 0 } });
  }
}