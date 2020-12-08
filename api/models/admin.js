const mongoose = require('mongoose');
const user_config = require('../util/config');
if (!user_config) {
	return;
}
const prefs = JSON.parse(user_config);

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

AdminSchema.methods.generateAuthToken = function () {
	const token = jwt.sign({ _id: this._id, admin: true }, prefs.signingKey);
	return token;
};

module.exports = mongoose.model('Admin', AdminSchema);

// ratingKey
