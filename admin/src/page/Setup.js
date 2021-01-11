import React from "react";
import Plex from "../data/Plex";
import { connect } from "react-redux";
import { ReactComponent as Spinner } from "../assets/svg/spinner.svg";
import { ReactComponent as Windows } from "../assets/svg/windows.svg";
import { ReactComponent as OSX } from "../assets/svg/mac.svg";
import { ReactComponent as Linux } from "../assets/svg/linux.svg";
import { ReactComponent as Docker } from "../assets/svg/docker.svg";
import { ReactComponent as Server } from "../assets/svg/server.svg";
import { ReactComponent as Good } from "../assets/svg/check.svg";
import { ReactComponent as Bad } from "../assets/svg/close.svg";
import Api from "../data/Api";

/* eslint-disable */
const popupCenter = (url, title, w, h) => {
  // Fixes dual-screen position                             Most browsers      Firefox
  var dualScreenLeft = window.screenLeft != undefined ? window.screenLeft : window.screenX;
  var dualScreenTop = window.screenTop != undefined ? window.screenTop : window.screenY;

  var width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
  var height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;

  var left = width / 2 - w / 2 + dualScreenLeft;
  var top = height / 2 - h / 2 + dualScreenTop;
  var newWindow = window.open(url, title, "scrollbars=yes, width=" + w + ", height=" + h + ", top=" + top + ", left=" + left);

  if (window.focus) newWindow.focus();
  return newWindow;
};
/* eslint-enable */

class Setup extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      step: 1,
      db: "mongo:27017",
      tls: false,
      password: "",
      selectedServer: false,
      mongoStatus: "",
      finalText: "Getting things set up...",
    };

    this.inputChange = this.inputChange.bind(this);
    this.saveUser = this.saveUser.bind(this);
    this.selectServer = this.selectServer.bind(this);
    this.changeToDb = this.changeToDb.bind(this);
    this.finalise = this.finalise.bind(this);
    this.next = this.next.bind(this);
    this.testMongo = this.testMongo.bind(this);
    this.waitText = this.waitText.bind(this);
  }

  serverIcon(platform) {
    switch (platform) {
      case "Linux":
        return <Linux />;

      case "Windows":
        return <Windows />;

      case "MacOSX":
        return <OSX />;

      case "docker":
        return <Docker />;

      default:
        return <Server />;
    }
  }

  inputChange(e) {
    const target = e.target;
    const name = target.name;
    let value = target.value;

    this.setState({
      [name]: value,
    });
  }

  componentDidUpdate() {
    if (this.props.plex.user && this.state.step === 1) {
      this.setState({
        step: 2,
      });
    }
    if (this.state.user && this.state.step === 2) {
      this.setState({
        step: 3,
      });
    }
  }

  loginOauth(e) {
    let plexWindow = popupCenter("", "Login with Plex", 500, 500);
    Plex.plexAuth(plexWindow);
  }

  saveUser() {
    let password = this.state.password;
    let username = this.props.plex.user.username;
    let id = this.props.plex.user.id;
    let email = this.props.plex.user.email;
    let token = this.props.plex.token;
    let thumb = this.props.plex.user.thumb;

    this.setState({
      user: {
        username: username,
        id: id,
        email: email,
        password: password,
        token: token,
        thumb: thumb,
      },
      password: false,
    });
  }

  selectServer(e) {
    const target = e.target;
    console.log(target);
    let id = target.dataset.id;
    this.setState({
      selectedServer: id,
    });
  }

  changeToDb() {
    this.setState({
      step: 4,
    });
  }

  next() {
    this.setState({
      step: this.state.step + 1,
    });
  }

  async testMongo() {
    this.setState({
      mongoStatus: "pending",
    });
    let db = "mongodb://" + this.state.db;
    let test = await Api.testMongo(db);
    this.setState({
      mongoStatus: test,
    });
  }

  async finalise() {
    this.setState({
      step: 5,
    });
    let selectedServer = this.props.plex.servers[this.state.selectedServer];
    let config = {
      user: this.state.user,
      server: selectedServer,
      db: "mongodb://" + this.state.db,
    };
    this.waitText();
    Api.saveConfig(config)
      .then(() => {
        setTimeout(() => {
          this.props.checkConfig();
        }, 10000);
      })
      .catch((err) => {
        alert("Setup failed, check API is running and no errors, if this persists please contact the dev team.");
        window.location.reload(false);
      });
  }

  async waitText() {
    await this.timeout(1000);
    this.setState({
      finalText: "Creating configs...",
    });
    await this.timeout(1000);
    this.setState({
      finalText: "Connecting to the database...",
    });
    await this.timeout(1000);
    this.setState({
      finalText: "Loading your libraries...",
    });
    await this.timeout(1000);
    this.setState({
      finalText: "Finding your embarassing movies...",
    });
    await this.timeout(1000);
    this.setState({
      finalText: "Finding your embarassing movies... oh wow...",
    });
    await this.timeout(1000);
    this.setState({
      finalText: "Matching content against online sources...",
    });
    await this.timeout(1000);
    this.setState({
      finalText: "Getting your friends...",
    });
    await this.timeout(1000);
    this.setState({
      finalText: "Finishing up...",
    });
    await this.timeout(5000);
    this.setState({
      finalText: "This is taking a while...",
    });
    await this.timeout(10000);
    this.setState({
      finalText: "Should really be done by now...",
    });
  }

  timeout(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  render() {
    return (
      <div className="setup--wrap">
        <div className="setup--steps">
          <div className={`setup--step ${this.state.step > 1 ? "complete" : ""} ${this.state.step === 1 ? "active" : ""}`}>1</div>
          <span></span>
          <div className={`setup--step ${this.state.step > 2 ? "complete" : ""} ${this.state.step === 2 ? "active" : ""}`}>2</div>
          <span></span>
          <div className={`setup--step ${this.state.step > 3 ? "complete" : ""} ${this.state.step === 3 ? "active" : ""}`}>3</div>
          <span></span>
          <div className={`setup--step ${this.state.step > 4 ? "complete" : ""} ${this.state.step === 4 ? "active" : ""}`}>4</div>
          <span></span>
          <div className={`setup--step ${this.state.step === 5 ? "active" : ""}`}>5</div>
        </div>
        <div className="setup--content">
          <p className="main-title">Setup</p>
          {this.state.step === 1 ? (
            <div className="step-1">
              <p>Welcome to Petio, firstly lets log in to Plex to get all of your user and server info</p>
              <button className="btn" onClick={this.loginOauth}>
                Login with plex
              </button>
            </div>
          ) : null}
          {this.state.step === 2 ? (
            <div className="step-2">
              <p>This is your Petio admin user details, we will use your Plex Username / Email, but a custom password just for Petio can be used.</p>
              <p>Petio Admin Username</p>
              <input type="text" name="username" value={this.props.plex.user.username} readOnly={true} />
              <p>Petio Admin Email</p>
              <input type="email" name="email" value={this.props.plex.user.email} readOnly={true} />
              <p>Petio Admin Password</p>
              <input type="password" name="password" value={this.state.password} onChange={this.inputChange} />
              <button className="btn" onClick={this.saveUser}>
                Next
              </button>
            </div>
          ) : null}
          {this.state.step === 3 ? (
            <div className="step-3">
              <p>Please select your server</p>
              {Object.keys(this.props.plex.servers).length === 0 ? (
                <p>You don't own any servers. Only the server owner can setup a Petio instance.</p>
              ) : (
                Object.keys(this.props.plex.servers).map((key) => {
                  let server = this.props.plex.servers[key];
                  return (
                    <div
                      key={key}
                      className={`server-select-option ${this.state.selectedServer === key ? "selected" : ""} ${server.status !== "connected" ? "disabled" : ""}`}
                      data-id={key}
                      onClick={this.selectServer}
                    >
                      <div className="server-icon">{this.serverIcon(server.platform)}</div>
                      <div className="server-name">
                        <p>{server.name}</p>
                        <p className="server-loc">{`${server.protocol}://${server.host}:${server.port}`}</p>
                      </div>
                      <div className="server-status">
                        <div className={`server-status-item server-status-pending ${server.status === "pending" ? "active" : ""}`}>
                          <Spinner />
                        </div>
                        <div className={`server-status-item server-status-good ${server.status === "connected" ? "active" : ""}`}>
                          <span>
                            <Good />
                          </span>
                        </div>
                        <div className={`server-status-item server-status-bad ${server.status === "failed" ? "active" : ""}`}>
                          <span>
                            <Bad />
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <button className={"btn " + (this.state.selectedServer ? "" : "disabled")} style={{ marginTop: "10px" }} onClick={this.changeToDb}>
                Next
              </button>
            </div>
          ) : null}
          {this.state.step === 4 ? (
            <div className="step-4">
              <p>Mongo Database path, leave this as default unless you have configured your database differently to recommended.</p>
              <div className="mongo-wrap">
                <div className="mongo-icon">
                  <Server />
                </div>
                <div className="mongo-content">
                  <div className="mongo-prefix">mongodb://</div>
                  <input type="text" name="db" value={this.state.db} onChange={this.inputChange} />
                </div>
                <div className="mongo-status">
                  <div className={`mongo-status-item mongo-status-pending ${this.state.mongoStatus === "pending" ? "active" : ""}`}>
                    <Spinner />
                  </div>
                  <div className={`mongo-status-item mongo-status-good ${this.state.mongoStatus === "connected" ? "active" : ""}`}>
                    <span>
                      <Good />
                    </span>
                  </div>
                  <div className={`mongo-status-item mongo-status-bad ${this.state.mongoStatus === "failed" ? "active" : ""}`}>
                    <span>
                      <Bad />
                    </span>
                  </div>
                </div>
              </div>
              <button className={`btn ${this.state.mongoStatus === "pending" ? "disabled" : ""}`} style={{ marginTop: "10px", marginRight: "10px" }} onClick={this.testMongo}>
                Test
              </button>
              <button className={`btn ${this.state.mongoStatus !== "connected" ? "disabled" : ""}`} style={{ marginTop: "10px" }} onClick={this.finalise}>
                Finish
              </button>
            </div>
          ) : null}
          {this.state.step === 5 ? (
            <div className="step-5">
              <p>{this.state.finalText}</p>
              <div className="loading">
                <Spinner />
              </div>
            </div>
          ) : null}
        </div>
      </div>
    );
  }
}

function SetupContainer(props) {
  return <Setup plex={props.plex} api={props.api} user={props.user} checkConfig={props.checkConfig} />;
}

const mapStateToProps = function (state) {
  return {
    plex: state.plex,
    api: state.api,
    user: state.user,
  };
};

export default connect(mapStateToProps)(SetupContainer);
