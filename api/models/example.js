const mongoose = require('mongoose');

const ExampleSchema = mongoose.Schema({
	title: String,
	content: String,
	date: {
		type: Date,
		default: Date.now,
	},
});

module.exports = mongoose.model('Example', ExampleSchema);
