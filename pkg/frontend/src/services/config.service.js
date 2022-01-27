import { get, post } from '../helpers';

export function checkConfig() {
	return get('/config');
}

export async function saveConfig(config) {
	try {
		await post(`/setup/set`, config);
	} catch (e) {
		console.log(e);
		throw 'Error saving your config';
	}
}

export async function testMongo(mongo) {
	try {
		let result = await post(`/setup/test_mongo`, { mongo });
		return result.status;
	} catch (err) {
		console.log(err);
		return 'failed';
	}
}
