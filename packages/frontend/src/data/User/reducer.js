import * as types from "../actionTypes";

export default function (
  state = {
    current: false,
    logged_in: false,
    credentials: false,
    library_index: false,
    requests: false,
    email: false,
  },
  action
) {
  switch (action.type) {
    case types.LOGIN:
      return {
        ...state,
        current: action.data.user,
        logged_in: true,
      };

    case types.LOGOUT:
      return {
        ...state,
        current: false,
        logged_in: false,
        credentials: false,
      };

    case types.CREDENTIALS:
      return {
        ...state,
        credentials: action.credentials,
      };

    case types.CREDENTIALS_EMAIL:
      return {
        ...state,
        email: action.credentials,
      };

    case types.LIBRARIES_INDEX:
      return {
        ...state,
        library_index: action.libraries,
      };

    case types.LOGIN_ADMIN:
      return {
        ...state,
        logged_in: true,
        credentials: {
          plexToken: action.credentials.token,
        },
        current: action.credentials.username,
      };

    case types.GET_REQUESTS:
      return {
        ...state,
        requests: action.requests,
      };

    case types.GET_REVIEWS:
      return {
        ...state,
        reviews: {
          ...state.reviews,
          [action.id]: action.reviews,
        },
      };

    case types.UPDATE_QUOTA:
      return {
        ...state,
        current: {
          ...state.current,
          quotaCount: action.quota,
        },
      };

    default:
      return state;
  }
}
