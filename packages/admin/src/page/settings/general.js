import React from "react";
import Api from "../../data/Api";
import Plex from "../../data/Plex";

import { ReactComponent as Spinner } from "../../assets/svg/spinner.svg";

/* eslint-disable */
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
/* eslint-enable */

class General extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      base_path: "",
      login_type: false,
      plexPopular: false,
      token: false,
    };

    this.inputChange = this.inputChange.bind(this);
    this.closeMsg = false;
    this.loadConfigs = this.loadConfigs.bind(this);
    this.saveBasePath = this.saveBasePath.bind(this);
    this.saveLoginType = this.saveLoginType.bind(this);
    this.savePlexPopular = this.savePlexPopular.bind(this);
    this.testPlex = this.testPlex.bind(this);
  }

  newToken() {
    let plexWindow = popupCenter("", "Login with Plex", 500, 500);
    Plex.plexToken(plexWindow);
  }

  inputChange(e) {
    const target = e.target;
    const name = target.name;
    let value = target.value;

    if (target.type === "checkbox") {
      value = target.checked;
    }

    this.setState({
      [name]: value,
    });
  }

  async saveBasePath() {
    try {
      await Api.updateConfig({
        base_path: this.state.base_path,
      });
      this.props.msg({
        message: "Base Path Saved, Please restart!",
        type: "good",
      });
    } catch (err) {
      console.log(err);
      this.props.msg({
        message: "Failed to Save Base Path",
        type: "error",
      });
    }
  }

  async saveLoginType() {
    try {
      await Api.updateConfig({
        login_type: this.state.login_type,
      });
      this.props.msg({
        message: "Login Type Updated",
        type: "good",
      });
    } catch (err) {
      console.log(err);
      this.props.msg({
        message: "Failed to Change Login Type",
        type: "error",
      });
    }
  }

  async savePlexPopular() {
    try {
      await Api.updateConfig({
        plexPopular: this.state.plexPopular,
      });
      this.props.msg({
        message: "Plex Popular Saved",
        type: "good",
      });
    } catch (err) {
      console.log(err);
      this.props.msg({
        message: "Failed to Save Plex Popular",
        type: "error",
      });
    }
  }

  async loadConfigs() {
    try {
      let config = await Api.getConfig();
      this.setState({
        base_path: config.base_path ? config.base_path : "",
        login_type: config.login_type ? config.login_type : 1,
        plexPopular:
          config.plexPopular === null || config.plexPopular === undefined
            ? true
            : config.plexPopular,
        loading: false,
      });
      this.props.msg({
        message: "Config Loaded",
      });
    } catch (err) {
      console.log(err);
      this.props.msg({
        message: "Failed to Load Config",
        type: "good",
      });
    }
  }

  async testPlex() {
    try {
      let plexConnect = await Api.testPlex();
      if (plexConnect.error) {
        this.props.msg({
          message: `Plex Test Failed: ${plexConnect.error}`,
          type: "error",
        });
      } else {
        this.props.msg({
          message: "Plex Test Passed!",
          type: "good",
        });
      }
    } catch (err) {
      this.props.msg({
        message: `Plex Test Failed: ${err}`,
        type: "error",
      });
    }
  }

  componentDidMount() {
    this.loadConfigs();
  }

  componentDidUpdate() {
    if (this.state.token !== this.props.plex.token) {
      this.setState({
        token: this.props.plex.token,
      });
      if (this.props.plex.token)
        this.props.msg({
          type: "good",
          message: "Token Updated!",
        });
    }
  }

  componentWillUnmount() {
    clearInterval(this.closeMsg);
  }

  render() {
    if (this.state.loading) {
      return (
        <>
          <div className="spinner--settings">
            <Spinner />
          </div>
        </>
      );
    }
    return (
      <>
        <section>
          <p className="main-title">General</p>
        </section>
        <section>
          <p className="main-title mb--2">Plex</p>
          <p className="description">
            If connection has been lost to Plex re-authenticate here.
          </p>
          <button className="btn btn__square" onClick={this.newToken}>
            Login with plex
          </button>
          <button
            className="btn btn__square"
            style={{ marginLeft: "10px" }}
            onClick={this.testPlex}
          >
            Test
          </button>
        </section>
        <section>
          <p className="main-title mb--2">Base path</p>
          <p className="description">
            A base path can be applied to serve petio from a subdirectory. Any
            specified base must not include a trailing slash and will be applied
            to the end of the access URL. For example <code>/petio</code> would
            become <code>localhost:7777/petio</code>
            <br></br>
            <small>
              Warning! This will require a restart of Petio to take effect.
            </small>
          </p>
          <input
            type="text"
            name="base_path"
            value={this.state.base_path}
            onChange={this.inputChange}
            autoCorrect="off"
            spellCheck="off"
          />
          <button className="btn btn__square" onClick={this.saveBasePath}>
            Save
          </button>
        </section>
        <section>
          <p className="main-title mb--2">User login</p>
          <p className="description">
            Logging into the admin panel in Petio will always require a
            Username/Email &amp; Password, however the standard user panel can
            be customised for <strong>Fast Login</strong> (where a user only
            needs to provide their Username / Email) or{" "}
            <strong>Standard Login</strong> (a user is required to enter a
            username and password)
          </p>
          <div className="select-wrap">
            <select
              name="login_type"
              value={this.state.login_type}
              onChange={this.inputChange}
            >
              <option value="1">Standard Login</option>
              <option value="2">Fast Login</option>
            </select>
          </div>
          <button className="btn btn__square" onClick={this.saveLoginType}>
            Save
          </button>
        </section>
        <section>
          <p className="main-title mb--2">Popular content on Plex</p>
          <p className="description">
            Display most popular titles from Plex in the discovery view.
            <br />
            Requires Plex Pass
          </p>
          <div className="checkbox-wrap mb--2">
            <input
              type="checkbox"
              name="plexPopular"
              checked={this.state.plexPopular}
              onChange={this.inputChange}
            />
            <p>Enabled</p>
          </div>
          <button className="btn btn__square" onClick={this.savePlexPopular}>
            Save
          </button>
        </section>
      </>
    );
  }
}

export default General;
