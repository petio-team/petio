import { createStore, applyMiddleware, combineReducers } from "redux";
import thunkMiddleware from "redux-thunk";

import user from "./reducers/user/reducer";
import media from "./reducers/media/reducer";
import pos from "./reducers/pos/reducer";
import system from "./reducers/system/reducer";

const bindMiddleware = (middleware) => {
  if (process.env.NODE_ENV !== "production") {
    const { composeWithDevTools } = require("redux-devtools-extension");
    return composeWithDevTools(applyMiddleware(...middleware));
  }
  return applyMiddleware(...middleware);
};

const initialState = {};

const rootReducer = combineReducers({
  pos,
  user,
  media,
  system,
});

const store = createStore(
  rootReducer,
  initialState,
  bindMiddleware([thunkMiddleware])
);

export default store;
