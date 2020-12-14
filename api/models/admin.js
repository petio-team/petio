const mongoose = require('mongoose');

const AdminSchema = mongoose.Schema(
	{
		_id: String,
		authToken: String,
		authentication_token: String,
		email: String,
		thumb: String,
		title: String,
		username: String,
		uuid: String,
		password: String,
		altId: String,
	},
	{ collection: 'admin' }
);

module.exports = mongoose.model('Admin', AdminSchema);

// ratingKey
