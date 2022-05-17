import Archive from "../models/archive";

export const getArchive = async (userId) => {
  const requests = await Archive.find({ users: userId });
  return { requests };
};
