import React from "react";
import ReactDOM from "react-dom";
import App from "./pages/_app";

import { HashRouter } from "react-router-dom";
import store from "./redux/store";
import { Provider } from "react-redux";

const startApp = () => {
  ReactDOM.render(
    <Provider store={store}>
      <HashRouter>
        <App />
      </HashRouter>
    </Provider>,
    document.getElementById("root")
  );
};

startApp();
