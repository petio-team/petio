const mongoose = require("mongoose");

const DiscoverySchema = mongoose.Schema({
  id: String,
  movie: {
    genres: Object,
    people: {
      cast: Object,
      director: Object,
    },
    history: Object,
  },
  series: {
    genres: Object,
    people: {
      cast: Object,
      director: Object,
    },
    history: Object,
  },
});

module.exports = mongoose.model("Discover", DiscoverySchema);
