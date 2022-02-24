import mongoose from "mongoose";

const ProfileSchema = new mongoose.Schema(
  {
    name: String,
    sonarr: Object,
    radarr: Object,
    autoApprove: Boolean,
    autoApproveTv: Boolean,
    quota: Number,
    isDefault: Boolean,
  },
  { collection: "profiles" }
);

export default mongoose.model("Profile", ProfileSchema);
