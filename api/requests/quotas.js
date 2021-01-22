const User = require("../models/user");

class QuotaSystem {
  async reset() {
    console.log("QUOTA: Reseting Quotas");
    await User.updateMany({}, { $set: { quotaCount: 0 } });
  }
}

module.exports = QuotaSystem;
