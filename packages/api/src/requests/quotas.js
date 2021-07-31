import User from "../models/user";
import logger from "../util/logger";

class QuotaSystem {
  async reset() {
    logger.log("info", "QUOTA: Reseting Quotas");
    await User.updateMany({}, { $set: { quotaCount: 0 } });
  }
}

export default QuotaSystem;
