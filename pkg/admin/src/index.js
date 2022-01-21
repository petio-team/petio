import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import { initStore, store } from "./data/store";
import { Provider } from "react-redux";
import "./styles/main.scss";
import { BrowserRouter } from "react-router-dom";
import { API_URL } from "./data/http";

const startApp = () => {
  initStore();
  ReactDOM.render(
    <Provider store={store}>
      <BrowserRouter basename={API_URL}>
        <App />
      </BrowserRouter>
    </Provider>,
    document.getElementById("root")
  );
};

if (!window.cordova) {
  startApp();
} else {
  document.addEventListener("deviceready", startApp, false);
}
serviceWorker.unregister();
