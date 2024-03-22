const mongoose = require("mongoose");

const InvitationSchema = mongoose.Schema(
  {
    inviteCode: String,
    invitedBy: String,
    invitedOn: Date,
    expireOn: Date,
    acceptedOn: Date,
    accepted: Boolean,
    acceptedBy: [String],
    maxUses: Number,
    used: Number,
    libraries: [String],
    downloadPermitted: Boolean,
    email: String,
  },
  { collection: "invitations" }
);

module.exports = mongoose.model("Invitation", InvitationSchema);
