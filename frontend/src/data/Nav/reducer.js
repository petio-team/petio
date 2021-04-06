import * as types from "../actionTypes";

export default function (
  state = {
    pages: {},
  },
  action
) {
  switch (action.type) {
    case types.STORE_NAV:
      return {
        ...state,
        pages: {
          ...state.pages,
          [action.path]: {
            state: action.state,
            scroll: action.scroll,
          },
        },
      };

    default:
      return state;
  }
}
