const mongoose = require("mongoose");

const DiscoverySchema = mongoose.Schema({
  id: String,
  movie: {
    genres: Object,
    people: {
      cast: Object,
      director: Object,
    },
    history: Array,
  },
  series: {
    genres: Object,
    people: {
      cast: Object,
      director: Object,
    },
    history: Array,
  },
});

module.exports = mongoose.model("Discover", DiscoverySchema);
