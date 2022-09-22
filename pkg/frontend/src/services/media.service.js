import { get, post } from '../helpers';
import store from '../redux/store.js';

async function getTrending() {
  if (
    store.getState().media.trending.movies &&
    store.getState().media.trending.tv
  )
    return;
  try {
    const data = await get('/trending');
    let movies = {};
    let shows = {};
    let trending = {
      movies: [],
      tv: [],
      people: [],
      companies: [],
      networks: [],
    };
    const r = Math.floor(Math.random() * (10 - 0 + 1) + 0);
    data.movies.forEach((movie, i) => {
      if (!movie) return;
      if (r === i) featuredMovie(movie.id);
      movies[movie.id] = movie;
      trending.movies.push(movie.id);
    });
    data.tv.forEach((show) => {
      if (!show) return;
      shows[show.id] = show;
      trending.tv.push(show.id);
    });
    data.companies.forEach((company) => {
      trending.companies.push(company);
    });
    data.networks.forEach((company) => {
      trending.networks.push(company);
    });
    updateStore({ type: 'media/store-movies', movies: movies });
    updateStore({ type: 'media/store-shows', shows: shows });
    updateStore({ type: 'media/store-trending', trending: trending });

    return data;
  } catch (e) {
    throw e;
  }
}

async function featuredMovie(id) {
  if (store.getState().media.featured) {
    return;
  }
  try {
    const data = await getMovie(id);
    updateStore({ type: 'media/store-featured', data: data });
  } catch (e) {
    console.log(e);
  }
}

async function getMovie(id, minified = false, noextras = false) {
  if (!id) throw 'No ID';
  try {
    const data = await get(`/movie/lookup/${id}${minified ? '/minified' : ''}`);
    if (data.error) throw 'error';
    updateStore({
      type: 'media/store-movies',
      movies: { [data.id]: { ...data, ready: true } },
    });
    if (minified || noextras) return;
    if (data.recommendations) batchLookup(data.recommendations, 'movie');
    if (data.collection) batchLookup(data.collection, 'movie');
    return data;
  } catch (e) {
    updateStore({
      type: 'media/store-shows',
      shows: { [id]: 'error' },
    });
    throw e;
  }
}

async function getTv(id, minified = false, noextras = false) {
  if (!id) throw 'No ID';
  try {
    const data = await get(`/show/lookup/${id}${minified ? '/minified' : ''}`);
    if (data.error) throw 'error';
    updateStore({
      type: 'media/store-shows',
      shows: { [data.id]: { ...data, ready: true } },
    });
    if (minified || noextras) return;
    batchLookup(data.recommendations, 'tv');
    return data;
  } catch (e) {
    updateStore({
      type: 'media/store-shows',
      shows: { [id]: 'error' },
    });
    throw e;
  }
}

async function getPerson(id) {
  if (!id) throw 'No ID';
  try {
    const data = await get(`/person/lookup/${id}`);
    if (data.error) throw 'error';
    let movies = {};
    let shows = {};
    let moviesBatch = [];
    let showsBatch = [];
    data.movies.cast.forEach((movie) => {
      movies[movie.id] = movie;
      moviesBatch.push(movie.id);
    });
    data.movies.crew.forEach((movie) => {
      movies[movie.id] = movie;
      moviesBatch.push(movie.id);
    });
    data.tv.cast.forEach((show) => {
      shows[show.id] = show;
      showsBatch.push(show.id);
    });
    data.tv.crew.forEach((show) => {
      shows[show.id] = show;
      showsBatch.push(show.id);
    });

    batchLookup(moviesBatch, 'movie');
    batchLookup(showsBatch, 'tv');

    updateStore({
      type: 'media/store-people',
      people: { [data.info.id]: { ...data } },
    });
    updateStore({ type: 'media/store-movies', movies: movies });
    updateStore({ type: 'media/store-shows', shows: shows });
    return data;
  } catch (e) {
    updateStore({
      type: 'media/store-people',
      people: { [id]: 'error' },
    });
    throw e;
  }
}

function getCompany(id) {
  if (!id) throw 'No ID';
  return get(`/movie/company/${id}`);
}

function getNetwork(id) {
  if (!id) throw 'No ID';
  return get(`/show/network/${id}`);
}

async function lookup(type, page, params = {}) {
  try {
    // return post(`/${type}/discover`, { page, params });
    const data = await post(`/${type}/discover`, { page, params });
    if (type === 'movie') {
      let movies = {};
      data.results.forEach((movie) => {
        if (movie.id) {
          movies[movie.id] = movie;
          movies[movie.id].ready = true;
        }
      });
      updateStore({ type: 'media/store-movies', movies: movies });
      return data;
    } else if (type === 'show') {
      let shows = {};
      data.results.forEach((show) => {
        if (show.id) {
          shows[show.id] = show;
          shows[show.id].ready = true;
        }
      });
      updateStore({ type: 'media/store-shows', shows: shows });
      return data;
    }
  } catch (e) {
    throw `Error getting ${type === 'movies' ? 'Movies' : 'Shows'}`;
  }
}

async function getDiscovery(type = 'movies') {
  if (store.getState().media.discovery[type].length > 0) return;
  try {
    if (type === 'movies') {
      const data = await get('/discovery/movies');
      let movies = {};
      let discovery = [];
      data.forEach((row) => {
        if (row && row.results) {
          let thisRow = { title: row.title, results: [] };
          row.results.forEach((movie) => {
            if (movie.id) {
              movies[movie.id] = movie;
              thisRow.results.push(movie.id);
            }
          });
          discovery.push(thisRow);
        }
      });
      updateStore({ type: 'media/store-movies', movies: movies });
      updateStore({
        type: 'media/store-discovery-movies',
        discovery: discovery,
      });
      return data;
    } else if (type === 'tv') {
      const data = await get('/discovery/shows');
      let shows = {};
      let discovery = [];
      data.forEach((row) => {
        if (row && row.results) {
          let thisRow = { title: row.title, results: [] };
          row.results.forEach((show) => {
            if (show.id) {
              shows[show.id] = show;
              thisRow.results.push(show.id);
            }
          });
          discovery.push(thisRow);
        }
      });
      updateStore({ type: 'media/store-shows', shows: shows });
      updateStore({
        type: 'media/store-discovery-shows',
        discovery: discovery,
      });
      return data;
    }
    return false;
  } catch (e) {
    throw e;
  }
}

function searchUpdate(q) {
  if (!q || q.length === 0)
    updateStore({
      type: 'search/results',
      data: false,
    });
  updateStore({ type: 'search/update', query: q });
  return;
}

function updateStore(data = {}) {
  if (Object.keys(data).length === 0) return false;
  return store.dispatch(data);
}

export async function search(term) {
  if (!term) return;
  try {
    let searchResults = await get(`/search/${encodeURIComponent(term)}`);
    if (!searchResults) {
      throw 'Failed to search';
    }

    let movies = {};
    searchResults.movies.forEach((result) => {
      movies[result.id] = result;
    });
    updateStore({ type: 'media/store-movies', movies: movies });

    let shows = {};
    searchResults.shows.forEach((result) => {
      shows[result.id] = result;
    });
    updateStore({ type: 'media/store-shows', shows: shows });

    updateStore({ type: 'search/results', data: searchResults });
  } catch (e) {
    console.log(e);
    throw 'Error searching';
  }
}

async function batchLookup(ids, type = 'movie', minified = true) {
  if (ids && Array.isArray(ids) && ids.length > 0) {
    ids.forEach((id, i) => {
      ids[i] = parseInt(id);
    });
    try {
      const data = await post(`/batch/${type}`, {
        ids: ids,
        min: minified,
      });
      let items = {};
      if (!data) throw 'Batch lookup failed';
      data.forEach((item) => {
        if (item) {
          items[item.id] = item;
          if (items[item.id].collection === false) {
            // For some reason batch lookup returns false for collections?
            delete items[item.id].collection;
          }
        }
      });
      if (type === 'movie')
        updateStore({ type: 'media/store-movies', movies: items });
      if (type === 'tv')
        updateStore({ type: 'media/store-shows', shows: items });
    } catch (e) {
      console.log(e);
    }
  }
}

export default {
  getTrending,
  getMovie,
  getTv,
  getPerson,
  getDiscovery,
  getCompany,
  getNetwork,
  lookup,
  searchUpdate,
  search,
  batchLookup,
};
