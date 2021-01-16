import React from "react";
import { HashRouter, Switch, Route, Link, withRouter, useHistory } from "react-router-dom";
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

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoggedIn: false,
      loading: true,
      config: false,
      configChecked: true,
    };

    this.changeLogin = this.changeLogin.bind(this);
    this.checkConfig = this.checkConfig.bind(this);
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
    if (this.state.isLoggedIn && Object.keys(this.props.api.users).length === 0) {
      Api.allUsers();
    }
  }

  componentDidMount() {
    this.checkConfig();
  }

  render() {
    if (this.state.error) {
      return (
        <div className="app">
          <div className="setup--wrap">
            <p className="main-title">Error</p>
            <p>Something's wrong I can feel it...</p>
            <p>Ok, you've managed to get the admin front end to load. But it looks like I can't talk to the API service.</p>
            <p>
              Please make sure the API service has started and is still running without any errors. Just finished the setup wizard? If the API can't connect to the DB it will reject the configuration
              and needs a restart, so check the logs.
            </p>
            <p>Still stuck? Please report your issue to the dev team on discord and we will do our best to help you!</p>
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
          <div className="page-wrap">
            <Setup checkConfig={this.checkConfig} />
          </div>
        </div>
      );
    }
    if (!this.state.isLoggedIn) {
      return (
        <div className="app">
          <Login logged_in={this.state.isLoggedIn} changeLogin={this.changeLogin} />
        </div>
      );
    } else {
      return (
        <div className="app">
          <HashRouter>
            <Sidebar changeLogin={this.changeLogin} />
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
                <Route path="/users">
                  <div className="page-wrap">
                    <Users api={this.props.api} />
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
