export default function (
  state = {
    pages: {},
  },
  action
) {
  switch (action.type) {
    case "pos/store":
      let exists = state.pages[action.path];
      let carousels = {};
      let scroll = 0;
      if (exists) {
        carousels = exists.carousels;
        if (action.scroll) {
          scroll = action.scroll;
        } else if (exists.scroll) {
          scroll = exists.scroll;
        }
      }
      return {
        ...state,
        pages: {
          ...state.pages,
          [action.path]: {
            state: action.state,
            scroll: scroll,
            carousels: {
              ...carousels,
              ...action.carousels,
            },
          },
        },
      };

    case "pos/clear":
      return {
        ...state,
        pages: {},
      };

    default:
      return state;
  }
}
