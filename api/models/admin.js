const mongoose = require("mongoose");

const AdminSchema = mongoose.Schema(
  {
    id: String,
    authToken: String,
    authentication_token: String,
    email: String,
    thumb: String,
    title: String,
    username: String,
    uuid: String,
    password: String,
    altId: String,
    lastIp: String,
  },
  { collection: "admin" }
);

module.exports = mongoose.model("Admin", AdminSchema);

// ratingKey
