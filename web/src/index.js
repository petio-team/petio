import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { HashRouter } from 'react-router-dom';

import App from './pages/_app';
import store from './redux/store';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const startApp = () => {
  ReactDOM.render(
    <Provider store={store}>
      <HashRouter>
        <App />
      </HashRouter>
    </Provider>,
    document.getElementById('root'),
  );
};

if (!window.cordova) {
  startApp();
} else {
  document.addEventListener('deviceready', startApp, false);
}
serviceWorkerRegistration.unregister();
