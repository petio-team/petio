const mongoose = require("mongoose");

const FilterSchema = mongoose.Schema({
  id: String,
  data: Array,
});

module.exports = mongoose.model("Filter", FilterSchema);
