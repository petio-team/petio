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
    genreData: {
      movies: {},
      tv: {},
    },
    studios: {},
    studioData: {},
    networks: {},
    networkData: {},
    searchQuery: '',
    searchResults: false,
    featured: false,
  },
  action,
) {
  switch (action.type) {
    case 'media/store-movies':
      Object.keys(action.movies).forEach((id) => {
        if (
          action.movies[id].hasOwnProperty('imdb_data') &&
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
    case 'media/store-shows':
      Object.keys(action.shows).forEach((id) => {
        if (
          action.shows[id].hasOwnProperty('imdb_data') &&
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
    case 'media/store-people':
      return {
        ...state,
        people: { ...state.people, ...action.people },
      };
    case 'media/store-trending':
      return {
        ...state,
        trending: action.trending,
      };
    case 'media/store-discovery-movies':
      return {
        ...state,
        discovery: {
          ...state.discovery,
          movies: action.discovery,
        },
      };
    case 'media/store-discovery-shows':
      return {
        ...state,
        discovery: {
          ...state.discovery,
          tv: action.discovery,
        },
      };
    case 'media/store-featured':
      return {
        ...state,
        featured: action.data,
      };
    case 'search/update':
      return {
        ...state,
        searchQuery: action.query,
      };
    case 'search/results':
      return {
        ...state,
        searchResults: action.data,
      };
    case 'media/store-genre-data':
      return {
        ...state,
        genreData: {
          ...state.genreData,
          [action.mediaType]: {
            ...state.genreData[action.type],
            [action.id]: {
              ...state.genreData[action.mediaType][action.id],
              page: action.data.page,
              totalPages: action.data.total_pages,
              results: state.genreData[action.mediaType][action.id]
                ? [
                    ...state.genreData[action.mediaType][action.id].results,
                    ...action.data.results,
                  ]
                : action.data.results,
            },
          },
        },
      };
    case 'media/store-studio':
      return {
        ...state,
        studios: {
          ...state.studios,
          [action.id]: action.data,
        },
      };
    case 'media/store-network':
      return {
        ...state,
        networks: {
          ...state.networks,
          [action.id]: action.data,
        },
      };
    case 'media/store-studio-results':
      return {
        ...state,
        studioData: {
          ...state.studioData,
          [action.id]: {
            ...state.studioData[action.id],
            page: action.data.page,
            totalPages: action.data.total_pages,
            results: state.studioData[action.id]
              ? [...state.studioData[action.id].results, ...action.data.results]
              : action.data.results,
          },
        },
      };
    case 'media/store-network-results':
      return {
        ...state,
        networkData: {
          ...state.networkData,
          [action.id]: {
            ...state.networkData[action.id],
            page: action.data.page,
            totalPages: action.data.total_pages,
            results: state.networkData[action.id]
              ? [
                  ...state.networkData[action.id].results,
                  ...action.data.results,
                ]
              : action.data.results,
          },
        },
      };
    default:
      return state;
  }
}
