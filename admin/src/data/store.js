import { createStore, applyMiddleware } from 'redux';
import rootReducer from './reducers';
import thunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';

var store;

function initStore(initialState) {
	store = createStore(
		rootReducer,
		composeWithDevTools(),
		initialState,
		applyMiddleware(thunk)
	);
}

export { store, initStore };
