import { combineReducers } from "redux";
import api from "./Api/reducer";
import user from "./User/reducer";
import nav from "./Nav/reducer";

const rootReducer = combineReducers({
  api,
  user,
  nav,
});

export default rootReducer;
