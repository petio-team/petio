const mongoose = require("mongoose");

const FriendSchema = mongoose.Schema(
  {
    id: String,
    title: String,
    username: String,
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
  },
  { collection: "friends" }
);

module.exports = mongoose.model("Friend", FriendSchema);

// ratingKey
