import mongoose from 'mongoose';

const DiscoverySchema = new mongoose.Schema({
  id: { type: String, index: true },
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

export default mongoose.model('Discover', DiscoverySchema);
