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
    };

    this.inputChange = this.inputChange.bind(this);
    this.closeMsg = false;
    this.saveEmail = this.saveEmail.bind(this);
    this.loadConfigs = this.loadConfigs.bind(this);
    this.testEmail = this.testEmail.bind(this);
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
    await Api.saveEmailConfig({
      user: this.state.email_user,
      pass: this.state.email_pass,
      server: this.state.email_server,
      port: this.state.email_port,
      secure: this.state.email_secure,
      enabled: this.state.email_enabled,
    });

    this.setState({
      isError: false,
      isMsg: "Email settings saved!",
    });
    clearInterval(this.closeMsg);
    this.closeMsg = setInterval(() => {
      this.setState({
        isError: false,
        isMsg: false,
      });
    }, 3000);
  }

  async loadConfigs() {
    try {
      let email = await Api.getEmailConfig();
      this.setState({
        email_enabled: email.config.emailEnabled,
        email_user: email.config.emailUser,
        email_pass: email.config.emailPass,
        email_server: email.config.emailServer,
        email_port: email.config.emailPort,
        email_secure: email.config.emailSecure,
        loading: false,
        isError: false,
        isMsg: "Email config loaded",
      });
    } catch (err) {
      console.log(err);
      this.setState({
        loading: false,
        isError: "Error getting email config",
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

  async testEmail() {
    try {
      await this.saveEmail();
      let test = await Api.testEmail();
      console.log(test);
      if (test.result) {
        this.setState({
          isMsg: "Email test passed",
          isError: false,
        });
      } else {
        this.setState({
          isMsg: false,
          isError: "Email test Failed",
        });
      }
    } catch (err) {
      console.log(err);
      this.setState({
        isMsg: false,
        isError: "Email test Failed",
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
          <div className="spinner--settings">
            <Spinner />
          </div>
        </>
      );
    }
    return (
      <>
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
        <section>
          <p className="main-title">General</p>
        </section>
        <section>
          <p className="main-title mb--2">Plex</p>
          <p>If connection has been lost to Plex re-authenticate here.</p>
          <button className="btn btn__square disabled">Login with plex</button>
          <button className="btn btn__square disabled" style={{ marginLeft: "10px" }}>
            Test
          </button>
        </section>
        <section>
          <p className="main-title mb--2">Email</p>
          <label>Username</label>
          <input type="text" name="email_user" value={this.state.email_user} onChange={this.inputChange} autoComplete="new-password" autoCorrect="off" spellCheck="off" />
          <label>Password</label>
          <input type="password" name="email_pass" value={this.state.email_pass} onChange={this.inputChange} autoComplete="new-password" autoCorrect="off" spellCheck="off" />
          <label>SMTP Server</label>
          <input type="text" name="email_server" value={this.state.email_server} onChange={this.inputChange} autoComplete="new-password" autoCorrect="off" spellCheck="off" />
          <label>Port</label>
          <input type="number" name="email_port" value={this.state.email_port} onChange={this.inputChange} autoComplete="new-password" autoCorrect="off" spellCheck="off" />
          <div className="checkbox-wrap mb--2">
            <input type="checkbox" name="email_secure" checked={this.state.email_secure} onChange={this.inputChange} />
            <p>
              Use Secure <small>(For port 587 or 25 use false)</small>
            </p>
          </div>
          <div className="checkbox-wrap mb--2">
            <input type="checkbox" name="email_enabled" checked={this.state.email_enabled} onChange={this.inputChange} />
            <p>Enabled</p>
          </div>
          <p>
            Using Gmail? Make sure to allow "less secure apps" to allow Petio to send emails on your behalf. You can change this setting{" "}
            <a target="_blank" href="https://www.google.com/settings/security/lesssecureapps">
              here
            </a>
          </p>

          <button className="btn btn__square" style={{ marginRight: "10px" }} onClick={this.saveEmail}>
            Save
          </button>

          <button className="btn btn__square" onClick={this.testEmail}>
            Test
          </button>
        </section>
      </>
    );
  }
}

export default General;
