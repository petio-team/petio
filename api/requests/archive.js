const Archive = require("../models/archive");

async function getArchive(userId) {
  const requests = await Archive.find({ users: userId });
  return { requests };
}

module.exports = { getArchive };
