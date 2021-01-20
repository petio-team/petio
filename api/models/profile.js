const mongoose = require("mongoose");

const ProfileSchema = mongoose.Schema(
  {
    name: String,
    sonarr: Array,
    radarr: Array,
    autoApprove: Boolean,
    quota: Number,
  },
  { collection: "profiles" }
);

module.exports = mongoose.model("Profile", ProfileSchema);
