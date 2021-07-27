import Archive from "../models/archive";

async function getArchive(userId) {
  const requests = await Archive.find({ users: userId });
  return { requests };
}

export default { getArchive };
