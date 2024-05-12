export default function (
  state = {
    currentUser: {
      email: null,
      id: null,
      lastLogin: null,
      nameLower: null,
      quotaCount: null,
      role: null,
      thumb: null,
      title: null,
      username: null,
    },
    isAdminLogin: false,
    requests: null,
    myRequests: null,
    myRequestsArchive: null,
    plexServers: null,
    plexUser: null,
    config: null,
    reviews: [],
    users: [],
    history: [],
    issues: [],
  },
  action,
) {
  switch (action.type) {
    case 'user/set-current-user':
      return {
        ...state,
        currentUser: action.user,
        isAdminLogin: action.admin,
      };
    case 'user/logout':
      return {
        ...state,
        currentUser: false,
        isAdminLogin: false,
      };
    case 'user/update-requests':
      const existing = state.requests;
      if (existing)
        Object.keys(action.requests).forEach((key) => {
          if (existing[key]) {
            action.requests[key] = {
              ...existing[key],
              ...action.requests[key],
            };
          }
        });
      return { ...state, requests: action.requests };
    case 'user/my-requests':
      return { ...state, myRequests: action.requests };
    case 'user/my-requests-archive':
      return { ...state, myRequestsArchive: action.requests };
    case 'user/plex-token':
      return {
        ...state,
        plexUser: {
          ...state.plexUser,
          token: action.token,
        },
      };
    case 'user/plex-details':
      return {
        ...state,
        plexServers: action.servers,
        plexUser: {
          ...state.plexUser,
          ...action.user,
        },
      };

    case 'user/plex-server':
      return {
        ...state,
        plexServers: {
          ...state.plexServers,
          [action.key]: action.server,
        },
      };
    case 'user/get-config':
      return {
        ...state,
        config: action.config,
      };
    case 'user/all-reviews':
      return {
        ...state,
        reviews: action.reviews,
      };
    case 'user/all-users':
      return {
        ...state,
        users: action.users,
      };
    case 'user/watch-history':
      return {
        ...state,
        history: action.history,
      };
    case 'user/all-issues':
      return {
        ...state,
        issues: action.issues,
      };
    default:
      return state;
  }
}
