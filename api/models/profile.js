const mongoose = require("mongoose");

const ProfileSchema = mongoose.Schema(
  {
    name: String,
    sonarr: Object,
    radarr: Object,
    autoApprove: Boolean,
    quota: Number,
    isDefault: Boolean,
  },
  { collection: "profiles" }
);

module.exports = mongoose.model("Profile", ProfileSchema);
