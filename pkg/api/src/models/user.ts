import mongoose from "mongoose";

const FriendSchema = new mongoose.Schema(
  {
    id: String,
    title: String,
    username: String,
    nameLower: String,
    email: String,
    password: String,
    recommendationsPlaylistId: String,
    thumb: String,
    Server: Array,
    altId: String,
    lastIp: String,
    role: String,
    profile: String,
    custom: Boolean,
    disabled: Boolean,
    quotaCount: Number,
    custom_thumb: String,
    lastLogin: Date,
    petioTimestamp: Date,
  },
  { collection: "friends" }
);

export default mongoose.model("Friend", FriendSchema);
