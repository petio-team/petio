const Discovery = require("../models/discovery");

module.exports = async function getDiscovery(id) {
  if (!id) throw "No user";
  const discoveryPrefs = await Discovery.findOne({ id: id });
  let output = [];
  let movieGenres = discoveryPrefs.movie.genres;
  console.log(movieGenres);
};
