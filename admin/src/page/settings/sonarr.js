import React from "react";
import Api from "../../data/Api";

import { v4 as uuidv4 } from "uuid";

import { ReactComponent as Add } from "../../assets/svg/plus-circle.svg";
import { ReactComponent as ServerIcon } from "../../assets/svg/server.svg";

import { ReactComponent as Spinner } from "../../assets/svg/spinner.svg";
import Modal from "../../components/Modal";

class Sonarr extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      servers: false,
      loading: true,
      isError: false,
      isMsg: false,
      wizardOpen: false,
      enabled: false,
      title: "",
      protocol: "http",
      host: "localhost",
      port: "",
      profile: {
        id: null,
        name: '',
      },
      path: {
        id: null,
        location: '',
      },
      subpath: "",
      key: "",
      activeServer: false,
      uuid: false,
      needsTest: false,
    };

    this.inputChange = this.inputChange.bind(this);
    this.getSonarr = this.getSonarr.bind(this);
    this.saveServer = this.saveServer.bind(this);
    this.deleteServer = this.deleteServer.bind(this);
    this.openWizard = this.openWizard.bind(this);
    this.closeWizard = this.closeWizard.bind(this);
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.getSettings = this.getSettings.bind(this);

    this.closeMsg = false;
  }

  async saveServer(silent = false) {
    if (this.state.activeServer === false) {
      console.log("error");
      return;
    }
    let servers = this.state.servers;

    servers[this.state.activeServer] = {
      enabled: this.state.active,
      title: this.state.title,
      protocol: this.state.protocol,
      host: this.state.host,
      key: this.state.apikey,
      port: this.state.port,
      subpath: this.state.subpath === "/" ? "" : this.state.subpath,
      path: {
        id: this.state.path.id,
        location: this.state.path.location,
      },
      profile: {
        id: this.state.profile.id,
        name: this.state.profile.name,
      },
      uuid: this.state.uuid,
    };

    await Api.saveSonarrConfig(servers);
    this.getSonarr(true);

    if (!silent) {
      this.props.msg({
        message: "Sonarr settings saved!",
        type: "good",
      });
    }
  }

  async deleteServer(silent = false) {
    if (this.state.activeServer === false) {
      console.log("error");
      return;
    }

    let servers = this.state.servers;

    servers.splice(this.state.activeServer, 1);

    await Api.saveSonarrConfig(servers);
    this.getSonarr();
    if (!silent) {
      this.closeWizard();

      this.props.msg({
        message: "Sonarr Server Removed",
        type: "good",
      });
    }
  }

  async test(id, add = false) {
    if (!this.state.subpath.startsWith("/") && this.state.subpath.length > 0) {
      this.setState({
        subpath: "/" + this.state.subpath,
      });
      setTimeout(() => {
        this.test(id, add);
      }, 1000);
      return;
    }
    if (add) {
      await this.saveServer(true);
    }
    try {
      let result = await Api.testSonarr(id);
      if (result.connection) {
        this.setState({
          newServer: false,
          needsTest: false,
        });
        this.props.msg({
          message: "Sonarr Test Connection success!",
          type: "good",
        });
        await this.getSonarr(true);
        await this.getSettings(id);
      } else {
        this.props.msg({
          message: "Sonarr Test Connection failed!",
          type: "error",
        });
        this.deleteServer(true);
      }
    } catch (err) {
      this.props.msg({
        message: "Sonarr Test Connection failed! Error 2",
        type: "error",
      });
    }
  }

  inputChange(e) {
    const target = e.target;
    const name = target.name;
    let value = target.value;

    if (target.classList.contains("frt")) {
      this.setState({
        needsTest: true,
        enabled: false,
      });
    }

    if (target.type === "checkbox") {
      value = target.checked;
    }

    if (target.type === "select-one") {
      let title = target.options[target.selectedIndex].text;
      this.setState({
        [name]: value,
        [`${name}_title`]: title,
      });
    } else {
      this.setState({
        [name]: value,
      });
    }
  }

  async getSonarr(live = false) {
    this.setState({
      loading: live ? false : true,
    });
    try {
      let sonarr = await Api.sonarrConfig();
      this.setState({
        servers: sonarr,
        loading: false,
      });
    } catch (err) {
      console.log(err);
      this.setState({
        loading: false,
      });
    }
  }

  componentDidMount() {
    this.getSonarr();
  }

  componentWillUnmount() {
    clearInterval(this.closeMsg);
  }

  openWizard(id) {
    if (this.state.servers[id]) {
      this.setState({
        newServer: false,
        editWizardOpen: true,
        activeServer: id,
        enabled: this.state.servers[id].enabled
          ? this.state.servers[id].enabled
          : false,
        title: this.state.servers[id].title,
        protocol: this.state.servers[id].protocol,
        host: this.state.servers[id].host,
        port: this.state.servers[id].port,
        subpath: this.state.servers[id].subpath,
        key: this.state.servers[id].key,
        profile: {
          id: this.state.servers[id].profile.id,
          name: this.state.servers[id].profile.name,
        },
        path: {
          id: this.state.servers[id].path.id,
          location: this.state.servers[id].path.location,
        },
        uuid: this.state.servers[id].uuid,
        needsTest: false,
      });
      this.getSettings(this.state.servers[id].uuid);
    } else {
      this.setState({
        newServer: true,
        wizardOpen: true,
        activeServer: id,
        uuid: uuidv4(),
        needsTest: true,
      });
    }
  }

  closeWizard() {
    this.setState({
      enabled: false,
      title: "",
      protocol: "http",
      host: "localhost",
      port: null,
      subpath: "",
      key: "",
      profiles: false,
      paths: false,
      path: {
        id: null,
        location: '',
      },
      profile: {
        id: null,
        name: '',
      },
      wizardOpen: false,
      editWizardOpen: false,
      activeServer: false,
      uuid: false,
      newServer: false,
    });
  }

  openModal(id) {
    this.setState({
      [`${id}Open`]: true,
    });
  }

  closeModal(id) {
    this.setState({
      [`${id}Open`]: false,
      enabled: false,
      title: "",
      protocol: "http",
      host: "localhost",
      port: null,
      subpath: "",
      key: "",
      profiles: false,
      paths: false,
      path: {
        id: null,
        location: '',
      },
      profile: {
        id: null,
        name: '',
      },
      wizardOpen: false,
      editWizardOpen: false,
      activeServer: false,
      uuid: false,
    });
  }

  async getSettings(uuid) {
    try {
      let settings = await Api.sonarrOptions(uuid);
      if (settings.profiles.error || settings.paths.error) {
        return;
      }
      if (this.state.uuid === uuid)
        this.setState({
          profiles: settings.profiles.length > 0 ? settings.profiles : false,
          paths: settings.paths.length > 0 ? settings.paths : false,
        });
    } catch {
      return;
    }
  }

  render() {
    let serverCount = 0;
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
        <Modal
          title="Add new server"
          open={this.state.addServerOpen}
          submitText="Save"
          submit={
            this.state.needsTest
              ? false
              : () => {
                this.saveServer();
                this.closeModal("addServer");
              }
          }
          close={() => this.closeModal("addServer")}
          delete={
            this.state.newServer
              ? false
              : () => {
                this.deleteServer();
                this.closeModal("addServer");
              }
          }
        >
          <label>Title</label>
          <input
            className="styled-input--input"
            type="text"
            name="title"
            value={this.state.title}
            onChange={this.inputChange}
          />
          <label>Protocol</label>
          <div className="styled-input--select">
            <select
              name="protocol"
              value={this.state.protocol}
              onChange={this.inputChange}
              className="frt"
            >
              <option value="http">HTTP</option>
              <option value="https">HTTPS</option>
            </select>
          </div>
          <label>Host</label>
          <input
            className="styled-input--input frt"
            type="text"
            name="host"
            value={this.state.host}
            onChange={this.inputChange}
          />
          <label>Port</label>
          <input
            className="styled-input--input frt"
            type="number"
            name="port"
            value={this.state.port ? this.state.port : '8989'}
            onChange={this.inputChange}
          />
          <label>URL Base</label>
          <input
            className="styled-input--input frt"
            type="text"
            name="base"
            value={this.state.subpath ? this.state.subpath : '/'}
            onChange={this.inputChange}
          />
          <label>API Key</label>
          <input
            className="styled-input--input frt"
            type="text"
            name="apikey"
            value={this.state.key ? this.state.key : ''}
            onChange={this.inputChange}
          />
          <button
            className="btn btn__square mb--1"
            onClick={() => this.test(this.state.uuid, true)}
          >
            Test
          </button>
          <label>Profile</label>
          <div
            className={`styled-input--select ${this.state.profiles || this.state.needsTest ? "" : "disabled"
              }`}
          >
            <select
              name="profile"
              value={this.state.profile}
              onChange={this.inputChange}
            >
              {this.state.profiles &&
                !this.state.newServer &&
                !this.state.needsTest ? (
                <>
                  <option value="">Choose an option</option>
                  {this.state.profiles.map((item) => {
                    return (
                      <option key={`p__${item.id}`} value={item.id}>
                        {item.name}
                      </option>
                    );
                  })}
                </>
              ) : (
                <option value="">
                  {this.state.newServer || this.state.needsTest
                    ? "Please test connection"
                    : "Loading..."}
                </option>
              )}
            </select>
          </div>
          <label>Path</label>
          <div
            className={`styled-input--select ${this.state.profiles || this.state.needsTest ? "" : "disabled"
              }`}
          >
            <select
              name="path"
              value={this.state.path.location}
              onChange={this.inputChange}
            >
              {this.state.paths && !this.state.needsTest ? (
                <>
                  <option value="">Choose an option</option>
                  {this.state.paths.map((item) => {
                    return (
                      <option key={`pp__${item.id}`} value={item.id}>
                        {item.path}
                      </option>
                    );
                  })}
                </>
              ) : (
                <option value="">
                  {this.state.newServer || this.state.needsTest
                    ? "Please test connection"
                    : "Loading..."}
                </option>
              )}
            </select>
          </div>
          {!this.state.newServer &&
            this.state.path &&
            this.state.profile &&
            !this.state.needsTest ? (
            <div className="checkbox-wrap mb--2">
              <input
                type="checkbox"
                name="active"
                checked={this.state.active}
                onChange={this.inputChange}
              />
              <p>Enabled</p>
            </div>
          ) : null}
        </Modal>

        <section>
          <p className="main-title mb--2">Sonarr</p>
          <p className="description">
            Sonarr is a PVR. It can monitor multiple RSS feeds for new episodes
            of your favorite shows and will grab, sort and rename them.
          </p>
        </section>
        <section>
          <p className="main-title mb--2">Servers</p>
          <div className="sr--grid">
            {this.state.servers.map((server, i) => {
              serverCount++;
              return (
                <div key={server.uuid} className="sr--instance">
                  <div className="sr--instance--inner">
                    <ServerIcon />
                    <p className="sr--title">{server.title}</p>
                    <p>{`${server.protocol}://${server.host}:${server.port}`}</p>
                    <p>Status: {server.enabled ? "Enabled" : "Disabled"}</p>
                    <p>
                      Profile:{" "}
                      {server.profile.name ? server.profile.name : "Not set"}
                    </p>
                    <p>
                      Path: {server.path.name ? server.path.name : "Not set"}
                    </p>
                    <p className="small">
                      ID: {server.uuid ? server.uuid : "Error"}
                    </p>
                    <div className="btn-wrap">
                      <button
                        className="btn btn__square"
                        onClick={() => {
                          this.openModal("addServer");
                          this.openWizard(i);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn__square"
                        onClick={() => this.test(server.uuid)}
                      >
                        Test
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            <div className="sr--instance sr--add-new">
              <div
                className="sr--instance--inner"
                onClick={() => {
                  this.openModal("addServer");
                  this.openWizard(serverCount);
                }}
              >
                <p className="sr--title">Add new</p>
                <Add />
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }
}

export default Sonarr;
