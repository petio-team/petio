import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import App from './App';
import { initAuth } from './data/auth';
import { initStore, store } from './data/store';
import * as serviceWorker from './serviceWorker';
import './styles/main.scss';

const startApp = () => {
  initStore();
  initAuth();
  ReactDOM.render(
    <Provider store={store}>
      <App />
    </Provider>,
    document.getElementById('root'),
  );
};

if (!window.cordova) {
  startApp();
} else {
  document.addEventListener('deviceready', startApp, false);
}
serviceWorker.unregister();
