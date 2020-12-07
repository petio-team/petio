const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const user_config = require('../util/config');
if (!user_config) {
	return;
}
const prefs = JSON.parse(user_config);

const FriendSchema = mongoose.Schema(
	{
		_id: String,
		title: String,
		username: String,
		email: String,
		recommendationsPlaylistId: String,
		thumb: String,
		Server: Array,
	},
	{ collection: 'friends' }
);

FriendSchema.methods.generateAuthToken = function () {
	const token = jwt.sign({ _id: this._id, admin: false }, prefs.plexToken);
	return token;
};

module.exports = mongoose.model('Friend', FriendSchema);

// ratingKey
