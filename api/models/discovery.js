import mongoose from "mongoose";

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

export default mongoose.model("Discover", DiscoverySchema);
