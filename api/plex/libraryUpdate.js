// Config
const user_config = require('../util/config');
if (!user_config) {
	return;
}
const prefs = JSON.parse(user_config);

const Admin = require('../models/admin');
const request = require('xhr-request');
const xmlParser = require('xml2json');
const Library = require('../models/library');
const Movie = require('../models/movie');
const Music = require('../models/artist');
const Show = require('../models/show');
const User = require('../models/user');
const Request = require('../models/request');
const outlook = require('../mail/mailer');
const tmdbApikey = prefs.tmdbApi;
const tmdb = 'https://api.themoviedb.org/3/';
const Sonarr = require('../services/sonarr');

let mailer = [];

async function libraryUpdate() {
	await createAdmin();
	let libraries = false;
	let sonarr = new Sonarr();
	try {
		libraries = await getLibraries();
	} catch (err) {
		console.log(err);
	}

	if (libraries) {
		await saveLibraries(libraries);
		await updateLibraryContent(libraries);
		await updateFriends();
		console.log('sending mail!');
		execMail();
		sonarr.getRequests();
	} else {
		console.log("Couldn't update libraries");
	}
}

async function createAdmin() {
	let adminFound = await Admin.findOne({
		_id: prefs.adminId,
	});
	if (adminFound) {
		console.log('Admin Already Created, updating');
		try {
			adminData = await Admin.findOneAndUpdate(
				{ _id: prefs.adminId },
				{
					$set: {
						email: prefs.adminEmail,
						thumb: prefs.adminThumb,
						title: prefs.adminDisplayName,
						username: prefs.adminUsername,
						password: prefs.adminPass,
						altId: 1,
					},
				},
				{ new: true, useFindAndModify: false }
			);
		} catch (err) {
			console.log(err);
		}
	} else {
		console.log('Creating admin user');
		try {
			adminData = new Admin({
				_id: prefs.adminId,
				email: prefs.adminEmail,
				thumb: prefs.adminThumb,
				title: prefs.adminDisplayName,
				username: prefs.adminUsername,
				password: prefs.adminPass,
				altId: 1,
			});
			await adminData.save();
		} catch (err) {
			console.log(err);
		}
	}
}

function getLibraries() {
	return new Promise((resolve, reject) => {
		let url = `${prefs.plexProtocol}://${prefs.plexIp}:${prefs.plexPort}/library/sections/?X-Plex-Token=${prefs.plexToken}`;
		request(
			url,
			{
				method: 'GET',
				json: true,
			},
			function (err, data) {
				if (err) {
					console.log('Library update failed!');
					reject('Unable to get library info');
					throw err;
				}
				console.log('Found Libraries');
				resolve(data.MediaContainer);
			}
		);
	});
}

async function saveLibraries(libraries) {
	await Promise.all(
		libraries.Directory.map(async (lib) => {
			await saveLibrary(lib);
		})
	);
}

async function saveLibrary(lib) {
	console.log('Updating Library ' + lib);
	let libraryItem = false;
	try {
		libraryItem = await Library.findById(lib.uuid);
	} catch {
		console.log('Library Not found, attempting to create');
	}
	if (!libraryItem) {
		try {
			let newLibrary = new Library({
				_id: lib.uuid,
				allowSync: lib.allowSync,
				art: lib.art,
				composite: lib.composite,
				filters: lib.filters,
				refreshing: lib.refreshing,
				thumb: lib.thumb,
				key: lib.key,
				type: lib.type,
				title: lib.title,
				agent: lib.agent,
				scanner: lib.scanner,
				language: lib.language,
				uuid: lib.uuid,
				updatedAt: lib.updatedAt,
				createdAt: lib.createdAt,
				scannedAt: lib.scannedAt,
				content: lib.content,
				directory: lib.directory,
				contentChangedAt: lib.contentChangedAt,
				hidden: lib.hidden,
			});
			libraryItem = await newLibrary.save();
		} catch (err) {
			console.log(err);
		}
	} else {
		let updatedLibraryItem = false;
		try {
			updatedLibraryItem = await Library.updateOne(
				{ _id: lib.uuid },
				{
					$set: {
						allowSync: lib.allowSync,
						art: lib.art,
						composite: lib.composite,
						filters: lib.filters,
						refreshing: lib.refreshing,
						thumb: lib.thumb,
						key: lib.key,
						type: lib.type,
						title: lib.title,
						agent: lib.agent,
						scanner: lib.scanner,
						language: lib.language,
						uuid: lib.uuid,
						updatedAt: lib.updatedAt,
						createdAt: lib.createdAt,
						scannedAt: lib.scannedAt,
						content: lib.content,
						directory: lib.directory,
						contentChangedAt: lib.contentChangedAt,
						hidden: lib.hidden,
					},
				}
			);
		} catch (err) {
			console.log(err);
		}
		if (updatedLibraryItem) {
			console.log('Library Updated');
		}
	}

	console.log(libraryItem.key);
}

// Create Library content (creates movies / tv collections)

async function updateLibraryContent(libraries) {
	await Promise.all(
		libraries.Directory.map(async (lib) => {
			try {
				let libContent = await getLibrary(lib.key);
				Object.keys(libContent.Metadata).map((item) => {
					let obj = libContent.Metadata[item];
					if (obj.type === 'movie') {
						saveMovie(obj);
					} else if (obj.type === 'artist') {
						saveMusic(obj);
					} else if (obj.type === 'show') {
						saveShow(obj);
					} else {
						console.log(obj.type);
					}
				});
			} catch (err) {
				console.log(err);
			}
		})
	);
}

function getLibrary(id) {
	let url = `${prefs.plexProtocol}://${prefs.plexIp}:${prefs.plexPort}/library/sections/${id}/all?X-Plex-Token=${prefs.plexToken}`;
	// console.log(url);
	return new Promise((resolve, reject) => {
		request(
			url,
			{
				method: 'GET',
				json: true,
			},
			function (err, data) {
				if (err) {
					reject('Unable to get library content');
				}
				resolve(data.MediaContainer);
			}
		);
	});
}

async function saveMovie(movieObj) {
	let movieDb = false;
	let output = '';
	try {
		movieDb = await Movie.findById(movieObj.ratingKey);
	} catch {
		movieDb = false;
	}
	if (!movieDb) {
		output += 'Movie Not found - ';
		let idSource = movieObj.guid
			.replace('com.plexapp.agents.', '')
			.split('://')[0];
		let externalId = false;
		let externalIds = {};
		if (idSource === 'plex') {
			console.log(movieObj);
			// for (let guid of movieObj.Guid) {
			// 	let source = guid.id.split('://');
			// 	externalIds[source[0] + '_id'] = source[1];
			// }
		} else {
			if (idSource === 'themoviedb') {
				idSource = 'tmdb';
			}

			try {
				externalId = movieObj.guid
					.replace('com.plexapp.agents.', '')
					.split('://')[1]
					.split('?')[0];

				externalIds = await externalIdMovie(externalId);
			} catch (err) {
				if (!externalId) {
					console.log(
						`Error - unable to parse id source from: ${movieObj.guid} - Movie: ${movieObj.title}`
					);
				} else {
					console.log(err);
				}
			}
		}

		try {
			let newMovie = new Movie({
				_id: movieObj.ratingKey,
				title: movieObj.title,
				ratingKey: movieObj.ratingKey,
				key: movieObj.key,
				guid: movieObj.guid,
				studio: movieObj.studio,
				type: movieObj.type,
				titleSort: movieObj.titleSort,
				contentRating: movieObj.contentRating,
				summary: movieObj.summary,
				rating: movieObj.rating,
				year: movieObj.year,
				tagline: movieObj.tagline,
				thumb: movieObj.thumb,
				art: movieObj.art,
				duration: movieObj.duration,
				originallyAvailableAt: movieObj.originallyAvailableAt,
				addedAt: movieObj.addedAt,
				updatedAt: movieObj.updatedAt,
				primaryExtraKey: movieObj.primaryExtraKey,
				ratingImage: movieObj.ratingImage,
				Media: movieObj.Media,
				Genre: movieObj.Genre,
				Director: movieObj.Director,
				Writer: movieObj.Writer,
				Country: movieObj.Country,
				Role: movieObj.Role,
				idSource: idSource,
				externalId: externalId,
				imdb_id: externalIds.hasOwnProperty('imdb_id')
					? externalIds.imdb_id
					: false,
				tmdb_id: externalIds.hasOwnProperty('id')
					? externalIds.id
					: false,
			});
			movieDb = await newMovie.save();
		} catch (err) {
			// console.log(err);
		}
		if (movieDb) {
			output += 'Created ----------- New Movie Added!';
			mailAdded(movieObj, externalId);
		} else {
			output += 'Not Created';
		}
	} else {
		output += 'Movie Found in Db';
		let idSource = movieObj.guid
			.replace('com.plexapp.agents.', '')
			.split('://')[0];
		if (idSource === 'themoviedb') {
			idSource = 'tmdb';
		}
		let externalId = movieObj.guid
			.replace('com.plexapp.agents.', '')
			.split('://')[1]
			.split('?')[0];
		let externalIds = {};
		try {
			externalIds = await externalIdMovie(externalId);
		} catch (err) {
			console.log(err);
		}
		try {
			updatedMovie = await Movie.findOneAndUpdate(
				{
					_id: movieObj.ratingKey,
				},
				{
					$set: {
						title: movieObj.title,
						ratingKey: movieObj.ratingKey,
						key: movieObj.key,
						guid: movieObj.guid,
						studio: movieObj.studio,
						type: movieObj.type,
						titleSort: movieObj.titleSort,
						contentRating: movieObj.contentRating,
						summary: movieObj.summary,
						rating: movieObj.rating,
						year: movieObj.year,
						tagline: movieObj.tagline,
						thumb: movieObj.thumb,
						art: movieObj.art,
						duration: movieObj.duration,
						originallyAvailableAt: movieObj.originallyAvailableAt,
						addedAt: movieObj.addedAt,
						updatedAt: movieObj.updatedAt,
						primaryExtraKey: movieObj.primaryExtraKey,
						ratingImage: movieObj.ratingImage,
						Media: movieObj.Media,
						Genre: movieObj.Genre,
						Director: movieObj.Director,
						Writer: movieObj.Writer,
						Country: movieObj.Country,
						Role: movieObj.Role,
						idSource: idSource,
						externalId: externalId,
						imdb_id: externalIds.hasOwnProperty('imdb_id')
							? externalIds.imdb_id
							: false,
						tmdb_id: externalIds.hasOwnProperty('id')
							? externalIds.id
							: false,
					},
				},
				{ useFindAndModify: false }
			);
			mailAdded(movieObj, externalId);
		} catch {
			movieDb = false;
		}
	}
	// console.log(movieObj.title + ' - ' + output);
}

async function saveMusic(musicObj) {
	let musicDb = false;
	let output = '';
	try {
		musicDb = await Music.findById(musicObj.ratingKey);
	} catch {
		musicDb = false;
	}
	if (!musicDb) {
		output += 'Artist Not found - ';
		try {
			let newMusic = new Music({
				_id: musicObj.ratingKey,
				title: musicObj.title,
				ratingKey: musicObj.ratingKey,
				key: musicObj.key,
				guid: musicObj.guid,
				type: musicObj.type,
				summary: musicObj.summary,
				index: musicObj.index,
				thumb: musicObj.thumb,
				addedAt: musicObj.addedAt,
				updatedAt: musicObj.updatedAt,
				Genre: musicObj.Genre,
				Country: musicObj.Country,
			});
			musicDb = await newMusic.save();
		} catch (err) {
			console.log(err);
		}
		if (musicDb) {
			output += 'Created ----------- New Music Added!';
		} else {
			output += 'Not Created';
		}
	} else {
		output += 'Artist Found in Db';
	}
	// console.log(musicObj.title + ' - ' + output);
}

async function saveShow(showObj) {
	let showDb = false;
	let output = '';
	try {
		showDb = await Show.findById(showObj.ratingKey);
	} catch {
		showDb = false;
	}
	if (!showDb) {
		output += 'Show Not found - ';
		let idSource = showObj.guid
			.replace('com.plexapp.agents.', '')
			.split('://')[0];
		let externalIds = {};
		let tmdbId = false;
		if (idSource === 'plex') {
			for (let guid of showObj.Guid) {
				let source = guid.id.split('://');
				externalIds[source[0] + '_id'] = source[1];
				if (source[0] === 'tmdb') tmdbId = source[1];
			}
		} else {
			if (idSource === 'thetvdb') {
				idSource = 'tvdb';
			}
			if (idSource === 'themoviedb') {
				idSource = 'tmdb';
			}
			let externalId = showObj.guid
				.replace('com.plexapp.agents.', '')
				.split('://')[1]
				.split('?')[0];

			if (idSource !== 'tmdb') {
				try {
					tmdbId = await externalIdTv(externalId, idSource);
				} catch (err) {
					console.log(err);
					tmdbId = false;
				}
			} else {
				try {
					externalIds = await tmdbExternalIds(externalId);
				} catch (err) {
					console.log(err);
				}
			}
		}
		try {
			let newShow = new Show({
				_id: showObj.ratingKey,
				ratingKey: showObj.ratingKey,
				key: showObj.key,
				guid: showObj.guid,
				studio: showObj.studio,
				type: showObj.type,
				title: showObj.title,
				titleSort: showObj.titleSort,
				contentRating: showObj.contentRating,
				summary: showObj.summary,
				index: showObj.index,
				rating: showObj.rating,
				year: showObj.year,
				thumb: showObj.thumb,
				art: showObj.art,
				banner: showObj.banner,
				theme: showObj.theme,
				duration: showObj.duration,
				originallyAvailableAt: showObj.originallyAvailableAt,
				leafCount: showObj.leafCount,
				viewedLeafCount: showObj.viewedLeafCount,
				childCount: showObj.childCount,
				addedAt: showObj.addedAt,
				updatedAt: showObj.updatedAt,
				Genre: showObj.Genre,
				idSource: idSource,
				externalId: externalId,
				imdb_id: idSource === 'imdb' ? externalId : externalIds.imdb_id,
				tvdb_id: idSource === 'tvdb' ? externalId : externalIds.tvdb_id,
				tmdb_id: idSource === 'tmdb' ? externalId : tmdbId,
			});
			showDb = await newShow.save();
		} catch (err) {
			console.log(err);
		}
		if (showDb) {
			output += 'Created ----------- New Show Added!';
			mailAdded(showObj, externalId);
		} else {
			output += 'Not Created';
		}
	} else {
		output += 'Show Found in Db';
		let idSource = showObj.guid
			.replace('com.plexapp.agents.', '')
			.split('://')[0];
		if (idSource === 'thetvdb') {
			idSource = 'tvdb';
		}
		if (idSource === 'themoviedb') {
			idSource = 'tmdb';
		}
		let externalId = showObj.guid
			.replace('com.plexapp.agents.', '')
			.split('://')[1]
			.split('?')[0];
		let externalIds = {};
		let tmdbId = false;
		if (idSource !== 'tmdb') {
			try {
				tmdbId = await externalIdTv(externalId, idSource);
			} catch (err) {
				console.log(err, showObj.title);
			}
		} else {
			try {
				externalIds = await tmdbExternalIds(externalId);
			} catch (err) {
				console.log(err);
			}
		}
		try {
			updatedShow = await Show.findOneAndUpdate(
				{
					_id: showObj.ratingKey,
				},
				{
					$set: {
						ratingKey: showObj.ratingKey,
						key: showObj.key,
						guid: showObj.guid,
						studio: showObj.studio,
						type: showObj.type,
						title: showObj.title,
						titleSort: showObj.titleSort,
						contentRating: showObj.contentRating,
						summary: showObj.summary,
						index: showObj.index,
						rating: showObj.rating,
						year: showObj.year,
						thumb: showObj.thumb,
						art: showObj.art,
						banner: showObj.banner,
						theme: showObj.theme,
						duration: showObj.duration,
						originallyAvailableAt: showObj.originallyAvailableAt,
						leafCount: showObj.leafCount,
						viewedLeafCount: showObj.viewedLeafCount,
						childCount: showObj.childCount,
						addedAt: showObj.addedAt,
						updatedAt: showObj.updatedAt,
						Genre: showObj.Genre,
						idSource: idSource,
						externalId: externalId,
						imdb_id:
							idSource === 'imdb'
								? externalId
								: externalIds.imdb_id,
						tvdb_id:
							idSource === 'tvdb'
								? externalId
								: externalIds.tvdb_id,
						tmdb_id: idSource === 'tmdb' ? externalId : tmdbId,
					},
				},
				{ useFindAndModify: false }
			);
			mailAdded(showObj, externalId);
		} catch {
			showDb = false;
		}
	}
	// console.log(showObj.title + ' - ' + output);
}

// Get Plex Friends

async function updateFriends() {
	let friendList = false;
	try {
		friendList = await getFriends();
	} catch (err) {
		console.log(err);
	}
	// console.clear();
	// console.log(friendList);
	if (friendList) {
		Object.keys(friendList).map((item) => {
			saveFriend(friendList[item]);
		});
	}
}

function getFriends() {
	let url = `https://plex.tv/pms/friends/all?X-Plex-Token=${prefs.plexToken}`;
	return new Promise((resolve, reject) => {
		request(
			url,
			{
				method: 'GET',
				// json: true,
			},
			function (err, data) {
				if (err) {
					reject('Unable to get friends');
					console.log('Unable to get friends');
					console.log(err);
				}
				if (!data) {
					reject('no data');
				} else {
					let dataParse = JSON.parse(xmlParser.toJson(data));
					// console.log(dataParse.MediaContainer.User);
					if (dataParse.MediaContainer.User) {
						resolve(dataParse.MediaContainer.User);
					} else {
						reject('No User object returned');
					}
				}
			}
		);
	});
}

async function saveFriend(obj) {
	// Maybe delete all and rebuild each time?
	let friendDb = false;
	let output = '';
	try {
		friendDb = await User.findById(obj.id);
	} catch {
		friendDb = false;
	}
	if (!friendDb) {
		output += 'Friend Not found - ';
		try {
			let newFriend = new User({
				_id: obj.id,
				title: obj.title,
				username: obj.username,
				email: obj.email,
				recommendationsPlaylistId: obj.recommendationsPlaylistId,
				thumb: obj.thumb,
				Server: obj.Server,
			});
			friendDb = await newFriend.save();
		} catch (err) {
			console.log(err);
		}
		if (friendDb) {
			output += 'Created ----------- New Friend Added!';
		} else {
			output += 'Not Created';
		}
	} else {
		output += 'Friend Found in Db';
	}
	// console.log(obj.title + ' - ' + output);
}

async function mailAdded(plexData, ref_id) {
	let request = await Request.findOne({
		$or: [{ imdb_id: ref_id }, { tmdb_id: ref_id }, { tvdb_id: ref_id }],
	});
	// console.log(request);
	if (request) {
		request.users.map((user, i) => {
			sendMail(user, i, request);
		});
		Request.findOneAndRemove(
			{
				$or: [
					{ imdb_id: ref_id },
					{ tmdb_id: ref_id },
					{ tvdb_id: ref_id },
				],
			},
			{ useFindAndModify: false },
			function (err, data) {
				if (err) {
					console.log(err);
				} else {
					console.log('Request Removed!');
				}
			}
		);
	}
}

async function sendMail(user, i, request) {
	// let timeout = i * 3000;
	let userData = await User.findOne({ _id: user });
	if (!userData) {
		userData = {
			email: prefs.adminEmail,
		};
	}

	mailer.push([
		`${request.title} added to Plex!`,
		`${request.title} added to Plex!`,
		'Your request has now been processed and is ready to watch on Plex, thanks for your request!',
		`https://image.tmdb.org/t/p/w500${request.thumb}`,
		[userData.email],
	]);
}

function execMail() {
	console.log(mailer);
	mailer.forEach((mail, index) => {
		setTimeout(() => {
			outlook(mail[0], mail[1], mail[2], mail[3], mail[4]);
		}, 10000 * (index + 1));
	});
	mailer = [];
}

function externalIdTv(id, type) {
	let url = `${tmdb}find/${id}?api_key=${tmdbApikey}&language=en-US&external_source=${type}_id`;
	return new Promise((resolve, reject) => {
		request(
			url,
			{
				method: 'GET',
				json: true,
			},
			function (err, data) {
				if (err) {
					reject(err);
				}
				if (!data || !data.tv_results) {
					reject('Error no data returned from tmdb TV external');
				} else if (data.tv_results.length === 0) {
					reject('No matches');
				} else {
					resolve(data.tv_results[0].id);
				}
			}
		);
	});
}

function tmdbExternalIds(id) {
	let url = `${tmdb}tv/${id}/external_ids?api_key=${tmdbApikey}`;
	return new Promise((resolve, reject) => {
		request(
			url,
			{
				method: 'GET',
				json: true,
			},
			function (err, data) {
				if (err) {
					reject(err);
				}
				resolve(data);
			}
		);
	});
}

function externalIdMovie(id) {
	let url = `${tmdb}movie/${id}/external_ids?api_key=${tmdbApikey}`;
	return new Promise((resolve, reject) => {
		request(
			url,
			{
				method: 'GET',
				json: true,
			},
			function (err, data) {
				if (err) {
					reject(err);
				}
				resolve(data);
			}
		);
	});
}

module.exports = libraryUpdate;
