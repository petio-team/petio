import React from "react";
import Api from "../../data/Api";

import { v4 as uuidv4 } from "uuid";

import { ReactComponent as Add } from "../../assets/svg/plus-circle.svg";
import { ReactComponent as ServerIcon } from "../../assets/svg/server.svg";

import { ReactComponent as Spinner } from "../../assets/svg/spinner.svg";
import Modal from "./modal";

class Radarr extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      servers: false,
      loading: true,
      isError: false,
      isMsg: false,
      wizardOpen: false,
      active: false,
      title: "",
      protocol: "http",
      host: "localhost",
      port: "",
      profile: "",
      profile_title: "",
      path: "",
      path_title: "",
      active: false,
      base: "",
      apikey: "",
      path: false,
      profile: false,
      activeServer: false,
      uuid: false,
    };

    this.inputChange = this.inputChange.bind(this);
    this.getRadarr = this.getRadarr.bind(this);
    this.saveServer = this.saveServer.bind(this);
    this.deleteServer = this.deleteServer.bind(this);
    this.openWizard = this.openWizard.bind(this);
    this.closeWizard = this.closeWizard.bind(this);
    // this.test = this.test.bind(this);

    this.closeMsg = false;
  }

  async saveServer() {
    if (this.state.activeServer === false) {
      console.log("error");
      return;
    }
    let servers = this.state.servers;

    servers[this.state.activeServer] = {
      active: this.state.active,
      title: this.state.title,
      protocol: this.state.protocol,
      hostname: this.state.host,
      apiKey: this.state.apikey,
      port: this.state.port,
      urlBase: this.state.base,
      path: this.state.path,
      path_title: this.state.path_title,
      profile: this.state.profile,
      profile_title: this.state.profile_title,
      uuid: this.state.uuid,
    };

    console.log(servers);
    // return;
    await Api.saveRadarrConfig(servers);
    this.getRadarr();
    this.closeWizard();

    this.setState({
      isError: false,
      isMsg: "Radarr settings saved!",
    });

    clearInterval(this.closeMsg);
    this.closeMsg = setInterval(() => {
      this.setState({
        isError: false,
        isMsg: false,
      });
    }, 3000);
  }

  async deleteServer() {
    if (this.state.activeServer === false) {
      console.log("error");
      return;
    }

    let servers = this.state.servers;

    servers.splice(this.state.activeServer, 1);

    console.log(servers);
    // return;
    await Api.saveRadarrConfig(servers);
    this.getRadarr();
    this.closeWizard();

    this.setState({
      isError: false,
      isMsg: "Radarr Server Removed",
    });

    clearInterval(this.closeMsg);
    this.closeMsg = setInterval(() => {
      this.setState({
        isError: false,
        isMsg: false,
      });
    }, 3000);
  }

  async test(id) {
    try {
      let result = await Api.testRadarr(id);
      if (result.connection) {
        this.setState({
          isError: false,
          isMsg: "Radarr Test Connection success!",
        });
      } else {
        this.setState({
          isError: "Radarr Test Connection failed!",
          isMsg: false,
        });
      }
    } catch (err) {
      this.setState({
        isError: "Radarr Test Connection failed! Error 2",
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

  inputChange(e) {
    const target = e.target;
    const name = target.name;
    let value = target.value;

    if (target.type === "checkbox") {
      value = target.checked;
    }

    console.log(target.type);

    if (target.type === "select-one") {
      let title = target.options[target.selectedIndex].text;
      console.log(`${name}_title`);
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

  async getRadarr() {
    this.setState({
      loading: true,
    });
    try {
      let radarr = await Api.radarrConfig();
      this.setState({
        servers: radarr,
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
    this.getRadarr();
  }

  componentWillUnmount() {
    clearInterval(this.closeMsg);
  }

  openWizard(id) {
    if (this.state.servers[id]) {
      this.setState({
        editWizardOpen: true,
        activeServer: id,
        active: this.state.servers[id].active ? this.state.servers[id].active : false,
        title: this.state.servers[id].title,
        protocol: this.state.servers[id].protocol,
        host: this.state.servers[id].hostname,
        port: this.state.servers[id].port,
        base: this.state.servers[id].urlBase,
        apikey: this.state.servers[id].apiKey,
        active: this.state.servers[id].active,
        profile: this.state.servers[id].profile,
        profile_title: this.state.servers[id].profile_title,
        path: this.state.servers[id].path,
        path_title: this.state.servers[id].path_title,
        uuid: this.state.servers[id].uuid,
      });
    } else {
      this.setState({
        wizardOpen: true,
        activeServer: id,
        uuid: uuidv4(),
      });
    }
  }

  closeWizard() {
    this.setState({
      active: false,
      title: "",
      protocol: "http",
      host: "localhost",
      port: null,
      base: "",
      apikey: "",
      active: false,
      profiles: false,
      paths: false,
      path: false,
      profile: false,
      wizardOpen: false,
      editWizardOpen: false,
      activeServer: false,
      uuid: false,
    });
  }

  render() {
    let serverCount = 0;
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
        {this.state.wizardOpen ? <Modal title="Add New Server" edit={false} state={this.state} inputChange={this.inputChange} saveServer={this.saveServer} closeWizard={this.closeWizard} /> : null}
        {this.state.editWizardOpen ? (
          <Modal
            title={`Edit ${this.state.title}`}
            edit={true}
            state={this.state}
            inputChange={this.inputChange}
            saveServer={this.saveServer}
            closeWizard={this.closeWizard}
            deleteServer={this.deleteServer}
            type="radarr"
          />
        ) : null}
        <section>
          <p className="main-title mb--2">Radarr</p>
          <p className="capped-width">
            Radarr is a movie collection manager for Usenet and BitTorrent users. It can monitor multiple RSS feeds for new movies and will interface with clients and indexers to grab, sort, and
            rename them. It can also be configured to automatically upgrade the quality of existing files in the library when a better quality format becomes available.
          </p>
        </section>
        <section>
          <p className="main-title mb--2">Servers</p>
          <div className="sr--grid">
            {this.state.servers.map((server, i) => {
              serverCount++;
              return (
                <div className="sr--instance">
                  <div className="sr--instance--inner">
                    <ServerIcon />
                    <p className="sr--title">{server.title}</p>
                    <p>{`${server.protocol}://${server.hostname}:${server.port}`}</p>
                    <p>Status: {server.active ? "Enabled" : "Disabled"}</p>
                    <p>Profile: {server.profile_title ? server.profile_title : "Not set"}</p>
                    <p>Path: {server.path_title ? server.path_title : "Not set"}</p>
                    <p className="small">ID: {server.uuid ? server.uuid : "Error"}</p>
                    <div className="btn-wrap">
                      <button className="btn" onClick={() => this.openWizard(i)}>
                        Edit
                      </button>
                      <button className="btn" onClick={() => this.test(i)}>
                        Test
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            <div className="sr--instance sr--add-new">
              <div className="sr--instance--inner" onClick={() => this.openWizard(serverCount)}>
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

export default Radarr;
