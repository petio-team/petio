export default function (
  state = {
    movies: {},
    tv: {},
    people: {},
    trending: {},
    discovery: {
      movies: [],
      tv: [],
    },
    searchQuery: "",
    searchResults: {
      movies: [],
      shows: [],
      people: [],
      companies: [],
      networks: [],
    },
    featured: false,
  },
  action
) {
  switch (action.type) {
    case "media/store-movies":
      Object.keys(action.movies).forEach((id) => {
        if (
          action.movies[id].hasOwnProperty("imdb_data") &&
          !action.movies[id].imdb_data
        )
          delete action.movies[id].imdb_data;
        if (state.movies[id]) {
          action.movies[id] = {
            ...state.movies[id],
            ...action.movies[id],
          };
        }
      });
      return {
        ...state,
        movies: { ...state.movies, ...action.movies },
      };
    case "media/store-shows":
      Object.keys(action.shows).forEach((id) => {
        if (
          action.shows[id].hasOwnProperty("imdb_data") &&
          !action.shows[id].imdb_data
        )
          delete action.shows[id].imdb_data;
        if (state.tv[id]) {
          action.shows[id] = {
            ...state.tv[id],
            ...action.shows[id],
          };
        }
      });
      return {
        ...state,
        tv: { ...state.tv, ...action.shows },
      };
    case "media/store-people":
      return {
        ...state,
        people: { ...state.people, ...action.people },
      };
    case "media/store-trending":
      return {
        ...state,
        trending: action.trending,
      };
    case "media/store-discovery-movies":
      return {
        ...state,
        discovery: {
          ...state.discovery,
          movies: action.discovery,
        },
      };
    case "media/store-discovery-shows":
      return {
        ...state,
        discovery: {
          ...state.discovery,
          tv: action.discovery,
        },
      };
    case "media/store-featured":
      return {
        ...state,
        featured: action.data,
      };
    case "search/update":
      return {
        ...state,
        searchQuery: action.query,
      };
    case "search/results":
      return {
        ...state,
        searchResults: action.data,
      };
    default:
      return state;
  }
}
