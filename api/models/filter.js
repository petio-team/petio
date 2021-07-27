import mongoose from "mongoose";

const FilterSchema = mongoose.Schema({
  id: String,
  data: Array,
});

export default mongoose.model("Filter", FilterSchema);
