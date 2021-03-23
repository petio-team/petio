import React from "react";
import Api from "../../data/Api";

import { ReactComponent as Spinner } from "../../assets/svg/spinner.svg";

class General extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      email_user: "",
      email_pass: "",
      email_server: "",
      email_port: "",
      email_secure: false,
      email_enabled: false,
      base_path: "",
      login_type: false,
      discord_webhook: false,
      plexPopular: false,
    };

    this.inputChange = this.inputChange.bind(this);
    this.closeMsg = false;
    this.saveEmail = this.saveEmail.bind(this);
    this.loadConfigs = this.loadConfigs.bind(this);
    this.testEmail = this.testEmail.bind(this);
    this.saveBasePath = this.saveBasePath.bind(this);
    this.saveDiscord = this.saveDiscord.bind(this);
    this.saveLoginType = this.saveLoginType.bind(this);
    this.savePlexPopular = this.savePlexPopular.bind(this);
    this.testDiscord = this.testDiscord.bind(this);
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

  async saveEmail() {
    try {
      await Api.saveEmailConfig({
        user: this.state.email_user,
        pass: this.state.email_pass,
        server: this.state.email_server,
        port: this.state.email_port,
        secure: this.state.email_secure,
        enabled: this.state.email_enabled,
        from: this.state.email_from,
      });

      this.props.msg({ message: "Email Settings Saved!", type: "good" });
    } catch (err) {
      console.log(err);
      this.props.msg({
        message: "Failed to Save Email Settings",
        type: "error",
      });
    }
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

  async saveDiscord() {
    try {
      await Api.updateConfig({
        discord_webhook: this.state.discord_webhook,
      });
      this.props.msg({
        message: "Discord Webhook Saved",
        type: "good",
      });
    } catch (err) {
      console.log(err);
      this.props.msg({
        message: "Failed to Save Discord Webhook",
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
      let email = await Api.getEmailConfig();
      let config = await Api.getConfig();
      this.setState({
        email_enabled: email.config.emailEnabled,
        email_user: email.config.emailUser,
        email_pass: email.config.emailPass,
        email_server: email.config.emailServer,
        email_port: email.config.emailPort,
        email_secure: email.config.emailSecure,
        email_from: email.config.emailFrom,
        base_path: config.base_path ? config.base_path : "",
        login_type: config.login_type ? config.login_type : 1,
        discord_webhook: config.discord_webhook ? config.discord_webhook : "",
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

  async testDiscord() {
    try {
      await this.saveDiscord();
      let test = await Api.testDiscord();
      if (test.result) {
        this.props.msg({
          message: "Discord Test Passed!",
          type: "good",
        });
      } else {
        this.props.msg({
          message: "Discord Test Failed",
          type: "error",
        });
      }
    } catch (err) {
      console.log(err);
      this.props.msg({
        message: "Discord Test Failed",
        type: "error",
      });
    }
  }

  async testEmail() {
    try {
      await this.saveEmail();
      let test = await Api.testEmail();
      if (test.result) {
        this.props.msg({
          message: "Email Test Passed!",
          type: "good",
        });
      } else {
        this.props.msg({
          message: "Email Test Failed",
          type: "error",
        });
      }
    } catch (err) {
      console.log(err);
      this.props.msg({
        message: "Email Test Failed",
        type: "error",
      });
    }
  }

  componentDidMount() {
    this.loadConfigs();
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
          <button className="btn btn__square disabled">Login with plex</button>
          <button
            className="btn btn__square disabled"
            style={{ marginLeft: "10px" }}
          >
            Test
          </button>
        </section>
        <section>
          <p className="main-title mb--2">Email</p>
          <label>From Address</label>
          <input
            type="text"
            name="email_from"
            value={this.state.email_from}
            onChange={this.inputChange}
            autoComplete="new-password"
            autoCorrect="off"
            spellCheck="off"
          />
          <label>Username</label>
          <input
            type="text"
            name="email_user"
            value={this.state.email_user}
            onChange={this.inputChange}
            autoComplete="new-password"
            autoCorrect="off"
            spellCheck="off"
          />
          <label>Password</label>
          <input
            type="password"
            name="email_pass"
            value={this.state.email_pass}
            onChange={this.inputChange}
            autoComplete="new-password"
            autoCorrect="off"
            spellCheck="off"
          />
          <label>SMTP Server</label>
          <input
            type="text"
            name="email_server"
            value={this.state.email_server}
            onChange={this.inputChange}
            autoComplete="new-password"
            autoCorrect="off"
            spellCheck="off"
          />
          <label>Port</label>
          <input
            type="number"
            name="email_port"
            value={this.state.email_port}
            onChange={this.inputChange}
            autoComplete="new-password"
            autoCorrect="off"
            spellCheck="off"
          />
          <div className="checkbox-wrap mb--2">
            <input
              type="checkbox"
              name="email_secure"
              checked={this.state.email_secure}
              onChange={this.inputChange}
            />
            <p>
              Use Secure <small>(For port 587 or 25 use false)</small>
            </p>
          </div>
          <div className="checkbox-wrap mb--2">
            <input
              type="checkbox"
              name="email_enabled"
              checked={this.state.email_enabled}
              onChange={this.inputChange}
            />
            <p>Enabled</p>
          </div>
          <p className="description">
            Using Gmail? You can either create a{" "}
            <a
              target="_blank"
              rel="noreferrer"
              href="https://support.google.com/accounts/answer/185833"
            >
              One Time App Password
            </a>{" "}
            or you can choose to allow
            <a
              target="_blank"
              rel="noreferrer"
              href="https://www.google.com/settings/security/lesssecureapps"
            >
              {" "}
              Less Secure Apps
            </a>{" "}
            to allow Petio to send emails on your behalf.
          </p>

          <button
            className="btn btn__square"
            style={{ marginRight: "10px" }}
            onClick={this.saveEmail}
          >
            Save
          </button>

          <button className="btn btn__square" onClick={this.testEmail}>
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
          <p className="main-title mb--2">Discord</p>
          <p className="description">Please paste here your Discord webhook</p>
          <input
            type="text"
            name="discord_webhook"
            value={this.state.discord_webhook}
            onChange={this.inputChange}
            autoCorrect="off"
            spellCheck="off"
          />
          <button
            style={{ marginRight: "10px" }}
            className="btn btn__square"
            onClick={this.saveDiscord}
          >
            Save
          </button>
          <button
            className={`btn btn__square ${
              this.state.discord_webhook ? "" : "disabled"
            }`}
            onClick={this.testDiscord}
          >
            Test
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
