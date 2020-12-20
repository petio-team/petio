const mongoose = require('mongoose');

const FriendSchema = mongoose.Schema(
	{
		id: String,
		title: String,
		username: String,
		email: String,
		recommendationsPlaylistId: String,
		thumb: String,
		Server: Array,
		altId: String,
	},
	{ collection: 'friends' }
);

module.exports = mongoose.model('Friend', FriendSchema);

// ratingKey
