import mongoose from 'mongoose';

const FilterSchema = new mongoose.Schema({
  id: String,
  data: Array,
});

export default mongoose.model('Filter', FilterSchema);
