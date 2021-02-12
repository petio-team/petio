import React from "react";
import { HashRouter, Switch, Route } from "react-router-dom";
import { connect } from "react-redux";
import Sidebar from "./components/Sidebar";
import Login from "./components/Login";
import Dashboard from "./page/Dashboard";
import { ReactComponent as Spinner } from "./assets/svg/spinner.svg";
import Api from "./data/Api";
import Setup from "./page/Setup";
import Settings from "./page/Settings";
import Requests from "./page/Requests";
import Users from "./page/Users";
import Issues from "./page/Issues";
import Reviews from "./page/Reviews";

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoggedIn: false,
      loading: true,
      config: false,
      configChecked: true,
      mobMenuOpen: false,
    };

    this.closeMsg = false;
    this.changeLogin = this.changeLogin.bind(this);
    this.checkConfig = this.checkConfig.bind(this);
    this.toggleMobMenu = this.toggleMobMenu.bind(this);
    this.displayMessage = this.displayMessage.bind(this);
  }

  toggleMobMenu() {
    this.setState({
      mobMenuOpen: this.state.mobMenuOpen ? false : true,
    });
  }

  checkConfig() {
    this.setState({
      configChecked: true,
    });
    Api.checkConfig()
      .then((res) => {
        console.log(res);
        this.setState({
          config: res.config,
          loading: false,
        });
      })
      .catch(() => {
        this.setState({
          error: true,
          loading: false,
        });
      });
  }

  changeLogin(value) {
    this.setState({
      isLoggedIn: value,
    });
  }

  componentDidUpdate() {
    if (!this.state.config && !this.state.configChecked) {
      this.checkConfig();
    }
    if (
      this.state.isLoggedIn &&
      Object.keys(this.props.api.users).length === 0
    ) {
      Api.allUsers();
    }
  }

  componentDidMount() {
    this.checkConfig();
  }

  displayMessage(type = "msg", message = "") {
    if (type === "msg") {
      this.setState({
        isError: false,
        isMsg: message,
      });
    } else {
      this.setState({
        isError: message,
        isMsg: false,
      });
    }
    clearInterval(this.closeMsg);
    this.closeMsg = setInterval(() => {
      this.setState({
        isError: false,
        isMsg: false,
      });
    }, 3000);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="app">
          {this.state.isError ? (
            <div className="setting-msg error">
              <p>{this.state.isError}</p>
            </div>
          ) : null}
          {this.state.isMsg ? (
            <div className="setting-msg good">
              <p>{this.state.isMsg}</p>
            </div>
          ) : null}
          <div className="setup--wrap">
            <p className="main-title">Error</p>
            <p>Something&apos;s wrong...</p>
            <p>
              Ok, you&apos;ve managed to get the admin front end to load. But it
              looks like the API service isn&apos;t accessible.
            </p>
            <p>
              Please make sure the API service has started and is still running
              without any errors. Just finished the setup wizard? If the API
              can&apos;t connect to the DB it will reject the configuration and
              needs a restart, so check the logs.
            </p>
            <p>
              Still stuck? Please report your issue to the dev team on discord
              and we will do our best to help you!
            </p>
          </div>
        </div>
      );
    }
    if (this.state.loading) {
      return (
        <div className="spinner">
          <Spinner />
        </div>
      );
    }
    if (this.state.config === false) {
      return (
        <div className="app">
          {this.state.isError ? (
            <div className="setting-msg error">
              <p>{this.state.isError}</p>
            </div>
          ) : null}
          {this.state.isMsg ? (
            <div className="setting-msg good">
              <p>{this.state.isMsg}</p>
            </div>
          ) : null}
          <div className="page-wrap">
            <Setup checkConfig={this.checkConfig} />
          </div>
        </div>
      );
    }
    if (!this.state.isLoggedIn) {
      return (
        <div className="app">
          {this.state.isError ? (
            <div className="setting-msg error">
              <p>{this.state.isError}</p>
            </div>
          ) : null}
          {this.state.isMsg ? (
            <div className="setting-msg good">
              <p>{this.state.isMsg}</p>
            </div>
          ) : null}
          <Login
            displayMessage={this.displayMessage}
            logged_in={this.state.isLoggedIn}
            changeLogin={this.changeLogin}
          />
        </div>
      );
    } else {
      return (
        <div className="app">
          {this.state.isError ? (
            <div className="setting-msg error">
              <p>{this.state.isError}</p>
            </div>
          ) : null}
          {this.state.isMsg ? (
            <div className="setting-msg good">
              <p>{this.state.isMsg}</p>
            </div>
          ) : null}
          <HashRouter>
            <div className="mob-menu-top">
              <div className="logo-wrap">
                <div className="logo">
                  Pet<span>io</span>
                </div>
              </div>
              <button
                className={`nav-toggle ${
                  this.state.mobMenuOpen ? "active" : ""
                }`}
                onClick={this.toggleMobMenu}
              >
                <span></span>
                <span></span>
                <span></span>
              </button>
            </div>
            <Sidebar
              mobOpen={this.state.mobMenuOpen}
              changeLogin={this.changeLogin}
            />
            <div className="view">
              <Switch>
                <Route exact path="/">
                  <div className="page-wrap">
                    <Dashboard user={this.props.user} api={this.props.api} />
                  </div>
                </Route>
                <Route path="/settings">
                  <div className="page-wrap">
                    <Settings />
                  </div>
                </Route>
                <Route path="/requests">
                  <div className="page-wrap">
                    <Requests user={this.props.user} api={this.props.api} />
                  </div>
                </Route>
                <Route path="/issues">
                  <div className="page-wrap">
                    <Issues user={this.props.user} api={this.props.api} />
                  </div>
                </Route>
                <Route path="/reviews">
                  <div className="page-wrap">
                    <Reviews user={this.props.user} api={this.props.api} />
                  </div>
                </Route>
                <Route path="/users">
                  <div className="page-wrap">
                    <Users api={this.props.api} />
                  </div>
                </Route>
                <Route path="*" exact>
                  <div className="page-wrap">
                    <h1 className="main-title mb--1">Not found</h1>
                    <p>This page doesn&apos;t exist</p>
                  </div>
                </Route>
              </Switch>
            </div>
          </HashRouter>
        </div>
      );
    }
  }
}

function AppContainer(props) {
  return <App plex={props.plex} api={props.api} user={props.user} />;
}

const mapStateToProps = function (state) {
  return {
    plex: state.plex,
    api: state.api,
    user: state.user,
  };
};

export default connect(mapStateToProps)(AppContainer);
