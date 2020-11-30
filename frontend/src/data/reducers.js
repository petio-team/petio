import { combineReducers } from 'redux';
import mediabutler from './Mediabutler/reducer';
import plex from './Plex/reducer';
import user from './User/reducer';

const rootReducer = combineReducers({
	plex,
	mediabutler,
	user,
});

export default rootReducer;
