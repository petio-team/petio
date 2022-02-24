import mongoose from "mongoose";

const DiscoverySchema = new mongoose.Schema({
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
