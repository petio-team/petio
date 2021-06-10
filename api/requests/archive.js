const Archive = require("../models/request");

async function getArchive(userId) {
  const requests = await Archive.find({ users: userId });
  return { requests };
}

module.exports = { getArchive };
