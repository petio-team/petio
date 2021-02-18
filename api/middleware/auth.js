import assert from "assert";

exports.authRequired = (req, res, next) => {
	try {
		const { petio_jwt } = req.cookies;
		const { username } = verifyJwt(jwt);
		assert.strictEqual(username, getUser().username);
		next();
	} catch (error) {
		res.sendStatus(401);
	}
};
