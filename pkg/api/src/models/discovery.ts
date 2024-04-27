import mongoose from 'mongoose';

export type Discovery = mongoose.Document & {
  id: string;
  movie: {
    genres: object;
    people: {
      cast: object;
      director: object;
    };
    history: object;
  };
  series: {
    genres: object;
    people: {
      cast: object;
      director: object;
    };
    history: object;
  };
};

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

export default mongoose.model<Discovery>('Discover', DiscoverySchema);
