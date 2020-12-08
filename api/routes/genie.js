const express = require('express');
const router = express.Router();
const request = require('xhr-request');
const Movie = require('../models/movie');

// Config
const user_config = require('../util/config');
if (!user_config) {
	return;
}
const prefs = JSON.parse(user_config);

router.get('/:id/movie', async (req, res) => {
	let id = req.params.id;
	let data = await getHistory(id);
	let items = data.MediaContainer.Metadata;
	let genres = {};
	let directors = {};
	let cast = {};
	let directorsTotal = 0;
	let castTotal = 0;
	let genresTotal = 0;
	let watched = [];
	for (let i = 0; i < items.length; i++) {
		let listItem = items[i];
		if (listItem.type === 'movie') {
			let dbData = await Movie.findById(listItem.ratingKey);

			if (dbData) {
				watched.push(dbData.ratingKey);
				if (dbData.Genre) {
					Object.keys(dbData.Genre).map((i) => {
						genre = dbData.Genre[i].tag;
						if (genre in genres) {
							genres[genre] = genres[genre] + 1;
							genresTotal++;
						} else {
							genres[genre] = 1;
							genresTotal++;
						}
					});
				}

				if (dbData.Director) {
					Object.keys(dbData.Director).map((i) => {
						director = dbData.Director[i].tag;
						if (director in directors) {
							directors[director] = directors[director] + 1;
							directorsTotal++;
						} else {
							directors[director] = 1;
							directorsTotal++;
						}
					});
				}

				if (dbData.Role) {
					Object.keys(dbData.Role).map((i) => {
						actor = dbData.Role[i].tag;
						if (actor in cast) {
							cast[actor] = cast[actor] + 1;
							castTotal++;
						} else {
							cast[actor] = 1;
							castTotal++;
						}
					});
				}
			}
		}
	}

	let directorsAvg = directorsTotal / Object.keys(directors).length;
	let genresAvg = genresTotal / Object.keys(genres).length;
	let castAvg = castTotal / Object.keys(cast).length;
	let dirArr = [];
	let genreArr = [];
	let castArr = [];
	console.log(directorsAvg, genresAvg, castAvg);
	Object.keys(directors).map((i) => {
		if (directors[i] < directorsAvg) {
			delete directors[i];
		} else {
			dirArr.push(i);
		}
	});
	Object.keys(genres).map((i) => {
		if (genres[i] < genresAvg) {
			delete genres[i];
		} else {
			genreArr.push(i);
		}
	});
	Object.keys(cast).map((i) => {
		if (cast[i] < castAvg) {
			delete cast[i];
		} else {
			castArr.push(i);
		}
	});

	let criteria = {
		watched: watched,
		genres: genreArr,
		directors: dirArr,
		cast: castArr,
		type: 'movie',
	};

	let matches = await findMatches(criteria);
	let ranked = rankMatches(matches, {
		cast: sortValues(cast),
		genres: sortValues(genres),
		directors: sortValues(directors),
		watchCount: watched.length,
	});
	res.send({
		watched: watched,
		genres: genres,
		directors: directors,
		cast: cast,
		matches: matches,
		rankings: ranked,
	});
});

function getHistory(id) {
	return new Promise((resolve, reject) => {
		let url = `${prefs.plexProtocol}://${prefs.plexIp}:${prefs.plexPort}/status/sessions/history/all?sort=viewedAt%3Adesc&accountID=${id}&viewedAt>=0&limit=20&X-Plex-Token=${prefs.plexToken}`;
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

async function findMatches(criteria) {
	if (criteria.type === 'movie') {
		try {
			let matches = await Movie.find({
				_id: {
					$nin: criteria.watched,
				},
				'Media.videoResolution': { $ne: '4k' },
				// 'Director.tag': { $in: criteria.directors },
				// 'Role.tag': { $in: criteria.cast },
				'Genre.tag': { $in: criteria.genres },
			});
			return matches;
		} catch (err) {
			console.log(err);
			return false;
		}
	}
}

function rankMatches(matches, criteria) {
	let rankings = {};
	let castWeighting = 10;
	let directorWeighting = 5;
	matches.map((el, i) => {
		let genreScore = 0;
		let castScore = 0;
		let directorScore = 0;
		matches[i].Genre.forEach((g) => {
			criteria.genres.forEach((cg) => {
				if (g.tag === cg[0]) {
					genreScore += cg[1] / criteria.watchCount;
				}
			});
		});
		if (matches[i].Role) {
			matches[i].Role.forEach((r) => {
				criteria.cast.forEach((cast) => {
					if (r.tag === cast[0]) {
						castScore += cast[1] / criteria.watchCount;
					}
				});
			});
		}
		if (matches[i].Director) {
			matches[i].Director.forEach((d) => {
				criteria.directors.forEach((director) => {
					if (d.tag === director[0]) {
						directorScore += director[1] / criteria.watchCount;
					}
				});
			});
		}

		let score = (genreScore + castScore + directorScore).toFixed(2);

		if (score > 0.68) {
			rankings[i] = {
				totalScore: score,
				title: matches[i].title,
				genre: genreScore,
				cast: castScore,
				director: directorScore,
			};
		}
	});
	return rankings;
}

function sortValues(list) {
	var sortable = [];
	for (var item in list) {
		sortable.push([item, list[item]]);
	}

	sortable.sort(function (a, b) {
		return a[1] - b[1];
	});

	return sortable;
}

module.exports = router;

// db.stuff.aggregate([
// 	{ $match: { name: 'Test' } }, // <== the fields that should always match
// 	{
// 		$facet: {
// 			matchedBoth: [
// 				{ $match: { country: 'USA', city: 'Seattle' } }, // <== bull's-eye
// 				{ $addFields: { weight: 10 } }, // <== 10 stones
// 			],
// 			matchedCity: [
// 				{ $match: { country: '', city: 'Seattle' } }, // <== the $match may need to be improved, see below
// 				{ $addFields: { weight: 5 } },
// 			],
// 			matchedCountry: [
// 				{ $match: { country: 'USA', city: '' } },
// 				{ $addFields: { weight: 0 } }, // <== weightless, yet still a match
// 			],
// 			// add more rules here, if needed
// 		},
// 	},
// 	// get them together. Should list all rules from above
// 	{
// 		$project: {
// 			doc: {
// 				$concatArrays: [
// 					'$matchedBoth',
// 					'$matchedCity',
// 					'$matchedCountry',
// 				],
// 			},
// 		},
// 	},
// 	{ $unwind: '$doc' }, // <== split them apart
// 	{ $sort: { 'doc.weight': -1 } }, // <== and order by weight, desc
// 	// reshape to retrieve documents in its original format
// 	{
// 		$project: {
// 			_id: '$doc._id',
// 			name: '$doc.name',
// 			country: '$doc.country',
// 			city: '$doc.city',
// 		},
// 	},
// ]);
