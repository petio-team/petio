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
            carousels: action.carousels,
          },
        },
      };

    case types.CLEAR_NAV:
      return {
        ...state,
        pages: {},
      };

    default:
      return state;
  }
}
