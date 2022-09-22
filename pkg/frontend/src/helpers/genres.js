const genres = {
  movie: {
    28: 'Action',
    12: 'Adventure',
    16: 'Animation',
    210024: 'Anime',
    5565: 'Biographical',
    207317: 'Christmas',
    35: 'Comedy',
    80: 'Crime',
    10123: 'Dark Comedy',
    99: 'Documentary',
    18: 'Drama',
    10751: 'Family',
    14: 'Fantasy',
    220064: 'Food',
    3149: 'Gangster',
    3335: 'Halloween',
    36: 'History',
    27: 'Horror',
    10391: 'Mafia',
    10402: 'Music',
    4344: 'Musical',
    9648: 'Mystery',
    15060: 'Period Drama',
    10749: 'Romance',
    878: 'Science Fiction',
    9672: 'True Story',
    53: 'Thriller',
    10770: 'TV Movie',
    10752: 'War',
    37: 'Western',
  },
  tv: {
    10759: 'Action & Adventure',
    16: 'Animation',
    210024: 'Anime',
    182282: 'Baking',
    5565: 'Biographical',
    35: 'Comedy',
    207317: 'Christmas',
    80: 'Crime',
    10123: 'Dark Comedy',
    99: 'Documentary',
    18: 'Drama',
    10751: 'Family',
    177040: 'Fashion Design',
    220064: 'Food',
    3149: 'Gangster',
    3335: 'Halloween',
    273139: 'Home Makeover',
    10762: 'Kids',
    10391: 'Mafia',
    9648: 'Mystery',
    4344: 'Musical',
    10763: 'News',
    15060: 'Period Drama',
    10764: 'Reality',
    10765: 'Sci-Fi & Fantasy',
    10766: 'Soap',
    10767: 'Talk',
    9672: 'True Story',
    10768: 'War & Politics',
    37: 'Western',
  },
};

export function matchGenre(type = 'movie', id = false) {
  let name = false;
  let query = {};
  let pId = parseInt(id);
  let customKeys = [
    210024, 207317, 3335, 4344, 3149, 10123, 5565, 9672, 10391, 220064, 177040,
    182282, 273139, 15060,
  ];
  if (!genres[type] || !genres[type][id]) return false;
  name = genres[type][id];
  if (customKeys.includes(pId)) {
    if (pId === 207317) pId += ',65'; // Add 'Holiday' to Christmas movies to refine
    query = {
      with_keywords: pId,
    };
  } else {
    query = {
      with_genres: pId,
    };
  }
  return {
    name: name,
    query: query,
  };
}

export function getGenres(type = 'movie') {
  return genres[type];
}
