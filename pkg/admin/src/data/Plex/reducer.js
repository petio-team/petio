import * as types from "../actionTypes";

export default function (
  state = {
    token: false,
  },
  action
) {
  switch (action.type) {
    case types.PLEX_TOKEN:
      return {
        ...state,
        token: action.token,
      };
    case types.PLEX_DETAILS:
      return {
        ...state,
        servers: action.servers,
        user: action.user,
      };

    case types.PLEX_SERVER:
      return {
        ...state,
        servers: {
          ...state.servers,
          [action.key]: action.server,
        },
      };

    default:
      return state;
  }
}
