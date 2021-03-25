import React from "react";
import { HashRouter, Switch, Route } from "react-router-dom";
import { connect } from "react-redux";
import User from "./data/User";
import Api from "./data/Api";
// import Plex from "./data/Plex";
import Sidebar from "./components/Sidebar";
import Search from "./pages/Search";
import Series from "./pages/Series";
import Season from "./pages/Season";
import Movie from "./pages/Movie";
import Actor from "./pages/Actor";
import Issues from "./components/Issues";
import Profile from "./pages/Profile";
import Movies from "./pages/Movies";
import Requests from "./pages/Requests";
import Shows from "./pages/Shows";
import { ReactComponent as Spinner } from "./assets/svg/spinner.svg";
import { ReactComponent as TmdbLogo } from "./assets/svg/tmdb.svg";
import pjson from "../package.json";
import Genre from "./pages/Genre";
import Networks from "./pages/Networks";
import Company from "./pages/Company";
import People from "./pages/People";

const popupCenter = (url, title, w, h) => {
  // Fixes dual-screen position | credit Tautulli
  var dualScreenLeft =
    window.screenLeft != undefined ? window.screenLeft : window.screenX;
  var dualScreenTop =
    window.screenTop != undefined ? window.screenTop : window.screenY;

  var width = window.innerWidth
    ? window.innerWidth
    : document.documentElement.clientWidth
    ? document.documentElement.clientWidth
    : screen.width;
  var height = window.innerHeight
    ? window.innerHeight
    : document.documentElement.clientHeight
    ? document.documentElement.clientHeight
    : screen.height;

  var left = width / 2 - w / 2 + dualScreenLeft;
  var top = height / 2 - h / 2 + dualScreenTop;
  var newWindow = window.open(
    url,
    title,
    "scrollbars=yes, width=" +
      w +
      ", height=" +
      h +
      ", top=" +
      top +
      ", left=" +
      left
  );

  if (window.focus) newWindow.focus();
  return newWindow;
};

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      mb_login: false,
      activeServerCheck: false,
      issuesOpen: false,
      isLoggedIn: this.props.user.logged_in,
      loading: true,
      configChecked: false,
      loginMsg: false,
      pushMsg: {},
      login_type: false,
    };

    this.openIssues = this.openIssues.bind(this);
    this.closeIssues = this.closeIssues.bind(this);
    this.loginForm = this.loginForm.bind(this);
    this.inputChange = this.inputChange.bind(this);
    this.logout = this.logout.bind(this);
    this.msg = this.msg.bind(this);
    this.loginOauth = this.loginOauth.bind(this);
  }

  inputChange(e) {
    const target = e.target;
    const name = target.name;
    let value = target.value;

    this.setState({
      [name]: value,
    });
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

  loginForm(e) {
    e.preventDefault();
    let username = this.state.username;

    this.login(username);
  }

  async login(username, cookie = false) {
    let password = this.state.password;
    let type = this.state.login_type;
    let user = {
      username: username,
      password: password,
      type: type,
    };
    if (/^\s/.test(username)) {
      this.msg({
        type: "error",
        message:
          "The username you entered contains a space before! Please remove it",
      });
      return;
    }
    if (/^\s/.test(password)) {
      this.msg({
        type: "error",
        message:
          "The password you entered contains a space before! Please remove it",
      });
      return;
    }
    if (!this.props.user.credentials || this.state.config === "failed") {
      return;
    }
    this.setState({
      loading: true,
    });
    try {
      let res = await User.login(user, cookie);
      this.setState({
        loading: false,
        loginMsg: false,
      });
      if (res.error) {
        this.msg({
          message: res.error,
          type: "error",
        });
        return;
      }
      if (res.loggedIn) {
        this.setState({
          isLoggedIn: true,
        });
      }
      if (res.admin) {
        this.setState({
          isAdmin: true,
        });
      }
      User.getRequests();
    } catch (error) {
      this.setState({
        loginMsg: error,
        loading: false,
      });
      localStorage.removeItem("petio_jwt");
    }
  }

  logout() {
    User.logout();
    this.setState({
      isLoggedIn: false,
      isAdmin: false,
    });
    this.msg({ message: "User logged out", type: "info" });
  }

  getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(";");
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == " ") {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }

  loginLocal() {
    if (this.getCookie("petio_jwt")) {
      if (this.props.user.credentials) {
        this.login("", true);
      } else {
        setTimeout(() => {
          this.loginLocal();
        }, 500);
      }
    } else {
      this.setState({
        loading: false,
      });
    }
  }

  openIssues() {
    this.setState({
      openIssues: true,
    });
  }

  closeIssues() {
    this.setState({
      openIssues: false,
    });
  }

  async checkConfig() {
    this.setState({
      configChecked: true,
    });
    try {
      let res = await Api.checkConfig();
      this.setState({
        config: res.config,
        login_type: parseInt(res.login_type),
      });
      if (res.config === false) {
        this.msg({ message: "Petio is not setup redirecting", type: "error" });
        window.location.href = "/admin/";
      }
    } catch {
      this.msg({ message: "API not reachable", type: "error" });
      this.setState({
        error: true,
        config: "failed",
      });
    }
  }

  componentDidUpdate() {
    if (this.props.user.credentials && !this.state.configChecked) {
      this.checkConfig();
    }
  }

  componentDidMount() {
    this.loginLocal();
    if (this.state.openIssues) {
      this.setState({
        openIssues: false,
      });
    }
  }

  async loginOauth() {
    try {
      let plexWindow = popupCenter("", "Login with Plex", 500, 500);
      this.setState({
        loading: true,
      });
      let res = await User.plexAuth(plexWindow);
      this.setState({
        loading: false,
        loginMsg: false,
      });
      if (res.error) {
        this.msg({
          message: res.error,
          type: "error",
        });
        return;
      }
      if (res.loggedIn) {
        this.setState({
          isLoggedIn: true,
        });
      }
      if (res.admin) {
        this.setState({
          isAdmin: true,
        });
      }
      User.getRequests();
    } catch (err) {
      this.msg({ message: err, type: "error" });
      this.setState({
        loading: false,
      });
    }
  }

  render() {
    if (this.state.loading) {
      return (
        <div className="login-wrap">
          <div className="spinner">
            <Spinner />
          </div>
        </div>
      );
    }

    if (!this.state.isLoggedIn) {
      return (
        <div className="login-wrap">
          <div className="push-msg--wrap">
            {Object.keys(this.state.pushMsg).map((i) => {
              let msg = this.state.pushMsg[i];
              return (
                <div
                  key={`${msg.timestamp}__${i}`}
                  className={`push-msg--item ${
                    msg.type !== "info" ? msg.type : ""
                  }`}
                >
                  {msg.message}
                </div>
              );
            })}
          </div>
          {!this.state.loading || !this.props.user.credentials ? (
            <>
              <div className="login--inner">
                <h1 className="logo">
                  Pet<span>io</span>
                </h1>
                <p className="main-title">
                  {!this.state.adminLogin ? "Login" : "Admin Login"}
                </p>
                <form onSubmit={this.loginForm} autoComplete="on">
                  <p style={{ marginBottom: "5px" }}>Username / Email</p>
                  <input
                    type="text"
                    name="username"
                    value={this.state.username}
                    onChange={this.inputChange}
                    autoComplete="username"
                  />
                  {this.state.login_type === 1 ? (
                    <>
                      <p style={{ marginBottom: "5px" }}>Password</p>
                      <input
                        type="password"
                        name="password"
                        value={this.state.password}
                        onChange={this.inputChange}
                        autoComplete="password"
                      />
                    </>
                  ) : null}
                  {this.state.loginMsg ? (
                    <div className="msg msg__error msg__input">
                      {this.state.loginMsg}
                    </div>
                  ) : null}
                  {this.state.config === "failed" ? (
                    <div className="msg msg__error msg__input">
                      API Not configured, please complete setup
                    </div>
                  ) : null}
                  <button className="btn btn__square btn__full">Login</button>
                </form>
                <div className="login--inner--divide">
                  <p>or</p>
                </div>
                <div>
                  <button
                    className="btn btn__square btn__full"
                    onClick={this.loginOauth}
                  >
                    Login with Plex
                  </button>
                </div>
              </div>
              <div className="credits">
                <a href="https://fanart.tv/" target="_blank" rel="noreferrer">
                  <p>
                    <strong>FAN</strong>ART<span>.TV</span>
                  </p>
                </a>
                <a
                  href="https://www.themoviedb.org/"
                  target="_blank"
                  rel="noreferrer"
                >
                  <TmdbLogo />
                </a>
              </div>
              <p className="powered-by">Petio build {pjson.version}</p>
            </>
          ) : (
            <div className="spinner">
              <Spinner />
            </div>
          )}
        </div>
      );
    } else {
      return (
        <div className="page">
          <HashRouter>
            <div className="sidebar">
              <Sidebar history={HashRouter.history} />
            </div>
            <div className="push-msg--wrap">
              {Object.keys(this.state.pushMsg).map((i) => {
                let msg = this.state.pushMsg[i];
                return (
                  <div
                    key={`msg__${msg.timestamp}__${i}`}
                    className={`push-msg--item ${
                      msg.type !== "info" ? msg.type : ""
                    }`}
                  >
                    {msg.message}
                  </div>
                );
              })}
            </div>
            <Switch>
              <Route exact path="/">
                <div className="page-wrap">
                  <div className="generic-wrap">
                    <Search msg={this.msg} />
                  </div>
                </div>
              </Route>
              <Route exact path="/user">
                <div className="page-wrap">
                  <div className="generic-wrap">
                    <Profile logout={this.logout} msg={this.msg} />
                  </div>
                </div>
              </Route>
              <Route exact path="/movie/:id">
                <Issues
                  open={this.state.openIssues}
                  close={this.closeIssues}
                  msg={this.msg}
                />
                <div className="page-wrap">
                  <div className="generic-wrap">
                    <Movie msg={this.msg} openIssues={this.openIssues} />
                  </div>
                </div>
              </Route>
              <Route exact path="/series/:id">
                <Issues
                  open={this.state.openIssues}
                  close={this.closeIssues}
                  msg={this.msg}
                />
                <div className="page-wrap">
                  <div className="generic-wrap">
                    <Series msg={this.msg} openIssues={this.openIssues} />
                  </div>
                </div>
              </Route>
              <Route exact path="/series/:id/season/:season">
                <Issues
                  open={this.state.openIssues}
                  close={this.closeIssues}
                  msg={this.msg}
                />
                <div className="page-wrap">
                  <Season openIssues={this.openIssues} msg={this.msg} />
                </div>
              </Route>
              <Route path="/person/:id">
                <Actor msg={this.msg} />
              </Route>
              <Route exact path="/requests">
                <div className="page-wrap">
                  <div className="generic-wrap">
                    <Requests />
                  </div>
                </div>
              </Route>
              {/* discovery pages */}
              <Route exact path="/movies">
                <div className="page-wrap">
                  <div className="generic-wrap">
                    <Movies msg={this.msg} />
                  </div>
                </div>
              </Route>
              <Route exact path="/tv">
                <div className="page-wrap">
                  <div className="generic-wrap">
                    <Shows msg={this.msg} />
                  </div>
                </div>
              </Route>
              <Route exact path="/genre/:type/:id">
                <div className="page-wrap">
                  <div className="generic-wrap">
                    <Genre msg={this.msg} />
                  </div>
                </div>
              </Route>
              <Route exact path="/networks/:id">
                <div className="page-wrap">
                  <div className="generic-wrap">
                    <Networks msg={this.msg} />
                  </div>
                </div>
              </Route>
              <Route exact path="/company/:id">
                <div className="page-wrap">
                  <div className="generic-wrap">
                    <Company msg={this.msg} />
                  </div>
                </div>
              </Route>
              <Route exact path="/people">
                <div className="page-wrap">
                  <div className="generic-wrap">
                    <People />
                  </div>
                </div>
              </Route>
              <Route path="*" exact>
                <div className="page-wrap">
                  <div className="generic-wrap">
                    <h1 className="main-title mb--1">Not found</h1>
                    <p>This page doesn&apos;t exist</p>
                  </div>
                </div>
              </Route>
            </Switch>
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
