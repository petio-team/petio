export default function (
  state = {
    server: {},
    bandwidth: [],
    sessions: [],
  },
  action,
) {
  switch (action.type) {
    case 'system/server':
      return {
        ...state,
        server: action.server,
      };

    case 'system/bandwidth':
      return {
        ...state,
        bandwidth: action.bandwidth,
      };

    case 'system/sessions':
      return {
        ...state,
        sessions: action.sessions,
      };

    default:
      return state;
  }
}
