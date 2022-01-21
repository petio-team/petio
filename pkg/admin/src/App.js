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
import Profile from "./page/Profile";
import User from "./data/User";

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoggedIn: false,
      loading: true,
      config: false,
      configChecked: true,
      mobMenuOpen: false,
      pushMsg: {},
    };

    this.closeMsg = false;
    this.changeLogin = this.changeLogin.bind(this);
    this.checkConfig = this.checkConfig.bind(this);
    this.toggleMobMenu = this.toggleMobMenu.bind(this);
    this.msg = this.msg.bind(this);
    this.logout = this.logout.bind(this);
  }

  toggleMobMenu() {
    this.setState({
      mobMenuOpen: this.state.mobMenuOpen ? false : true,
    });
  }

  async checkConfig(setup = false) {
    this.setState({
      configChecked: true,
    });
    try {
      let res = await Api.checkConfig();
      if (res.error) {
        this.props.msg({
          type: "error",
          message: res.error,
        });
        throw "Config error";
      }
      if (setup && !res.ready) {
        setTimeout(() => {
          this.checkConfig(true);
        }, 10000);
        return;
      }
      this.setState({
        config: res.config,
        loading: false,
      });
    } catch {
      this.setState({
        error: true,
        loading: false,
      });
    }

    Api.checkConfig()
      .then((res) => {
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

  msg(
    data = {
      message: String,
      type: "info",
    }
  ) {
    let timestamp = +new Date();
    let msgs = { ...this.state.pushMsg };
    msgs[timestamp] = data;
    this.setState({
      pushMsg: msgs,
    });

    setInterval(() => {
      let msgs = { ...this.state.pushMsg };
      delete msgs[timestamp];
      this.setState({
        pushMsg: msgs,
      });
    }, 3000);
  }

  logout() {
    User.logout();
    this.changeLogin(false);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="app">
          <div className="push-msg--wrap">
            {Object.keys(this.state.pushMsg).map((i) => {
              let msg = this.state.pushMsg[i];
              return (
                <div
                  data-key={`pm__${msg.timestamp}__${i}__error`}
                  key={`pm__${msg.timestamp}__${i}__error`}
                  className={`push-msg--item ${
                    msg.type !== "info" ? msg.type : ""
                  }`}
                >
                  {msg.message}
                </div>
              );
            })}
          </div>
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
          <div className="push-msg--wrap">
            {Object.keys(this.state.pushMsg).map((i) => {
              let msg = this.state.pushMsg[i];
              return (
                <div
                  key={`pm__${msg.timestamp}__${i}__setup`}
                  className={`push-msg--item ${
                    msg.type !== "info" ? msg.type : ""
                  }`}
                >
                  {msg.message}
                </div>
              );
            })}
          </div>
          <div className="page-wrap">
            <Setup msg={this.msg} checkConfig={this.checkConfig} />
          </div>
        </div>
      );
    }
    if (!this.state.isLoggedIn) {
      return (
        <div className="app">
          <div className="push-msg--wrap">
            {Object.keys(this.state.pushMsg).map((i) => {
              let msg = this.state.pushMsg[i];
              return (
                <div
                  key={`pm__${msg.timestamp}__${i}__login`}
                  className={`push-msg--item ${
                    msg.type !== "info" ? msg.type : ""
                  }`}
                >
                  {msg.message}
                </div>
              );
            })}
          </div>
          <Login
            msg={this.msg}
            logged_in={this.state.isLoggedIn}
            changeLogin={this.changeLogin}
          />
        </div>
      );
    } else {
      return (
        <div className="app">
          <div className="push-msg--wrap">
            {Object.keys(this.state.pushMsg).map((i) => {
              let msg = this.state.pushMsg[i];
              return (
                <div
                  key={`pm__${msg.timestamp}__${i}__logged_in`}
                  className={`push-msg--item ${
                    msg.type !== "info" ? msg.type : ""
                  }`}
                >
                  {msg.message}
                </div>
              );
            })}
          </div>
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
              toggleMobMenu={this.toggleMobMenu}
            />
            <div className="view">
              <Switch>
                <Route exact path="/">
                  <div className="page-wrap">
                    <Dashboard
                      user={this.props.user}
                      api={this.props.api}
                      msg={this.msg}
                    />
                  </div>
                </Route>
                <Route path="/user">
                  <div className="page-wrap">
                    <Profile logout={this.logout} />
                  </div>
                </Route>
                <Route path="/settings">
                  <div className="page-wrap">
                    <Settings msg={this.msg} />
                  </div>
                </Route>
                <Route path="/requests">
                  <div className="page-wrap">
                    <Requests
                      user={this.props.user}
                      api={this.props.api}
                      msg={this.msg}
                    />
                  </div>
                </Route>
                <Route path="/issues">
                  <div className="page-wrap">
                    <Issues
                      user={this.props.user}
                      api={this.props.api}
                      msg={this.msg}
                    />
                  </div>
                </Route>
                <Route path="/reviews">
                  <div className="page-wrap">
                    <Reviews
                      user={this.props.user}
                      api={this.props.api}
                      msg={this.msg}
                    />
                  </div>
                </Route>
                <Route path="/users">
                  <div className="page-wrap">
                    <Users api={this.props.api} msg={this.msg} />
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
