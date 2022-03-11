const User = require("../models/user");
const logger = require("../app/logger");

export default class QuotaSystem {
  async reset() {
    logger.verbose("QUOTA: Reseting Quotas", { label: "requests.quotas" });
    await User.updateMany({}, { $set: { quotaCount: 0 } });
  }
}
