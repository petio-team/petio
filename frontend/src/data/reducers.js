import { combineReducers } from "redux";
import api from "./Api/reducer";
import user from "./User/reducer";

const rootReducer = combineReducers({
  api,
  user,
});

export default rootReducer;
