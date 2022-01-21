import { combineReducers } from 'redux';
import api from './Api/reducer';
import plex from './Plex/reducer';
import user from './User/reducer';

const rootReducer = combineReducers({
	plex,
	api,
	user,
});

export default rootReducer;
