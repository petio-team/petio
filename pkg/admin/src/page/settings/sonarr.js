import React from 'react';

import { ReactComponent as Add } from '../../assets/svg/plus-circle.svg';
import { ReactComponent as ServerIcon } from '../../assets/svg/server.svg';
import { ReactComponent as Spinner } from '../../assets/svg/spinner.svg';
import Modal from '../../components/Modal';
import Api from '../../data/Api';

const makeSonarr = (instance) => {
  const defaults = {
    id: '',
    name: 'Server',
    protocol: 'http',
    host: 'localhost',
    port: 8989,
    subpath: '/',
    token: '',
    profile: 0,
    path: 0,
    language: 0,
    availability: 0,
    enabled: false,
    profiles: [],
    paths: [],
    languages: [],
    availabilities: [],
  };
  return { ...defaults, ...instance };
};
class Sonarr extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      servers: [],
      loading: true,
      isError: false,
      isMsg: false,
      wizardOpen: false,
      needsSave: true,
      activeInstance: makeSonarr(),
      activeInstanceId: 0,
    };

    this.inputChange = this.inputChange.bind(this);
    this.getSonarr = this.getSonarr.bind(this);
    this.saveServer = this.saveServer.bind(this);
    this.deleteServer = this.deleteServer.bind(this);
    this.openWizard = this.openWizard.bind(this);
    this.closeWizard = this.closeWizard.bind(this);
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);

    this.closeMsg = false;
  }

  async saveServer() {
    let server = this.state.activeInstance;
    if (server.name === "") {
      this.props.msg({
        message: "name field must not be empty",
        type: 'error',
      });
      return;
    }

    if (server.host === "") {
      this.props.msg({
        message: "host field must not be empty",
        type: 'error',
      });
      return;
    }

    if (server.port === "") {
      this.props.msg({
        message: "port field must not be empty",
        type: 'error',
      });
      return;
    }

    if (server.subpath === "") {
      this.props.msg({
        message: "url base field must not be empty",
        type: 'error',
      });
      return;
    }

    if (server.token === "") {
      this.props.msg({
        message: "token field must not be empty",
        type: 'error',
      });
      return;
    }

    try {
      const request = server;
      delete request.profiles;
      delete request.paths;
      delete request.availabilities;
      delete request.languages;

      const result = await Api.saveSonarrConfig(request);
      if (result.status === 'error') {
        this.props.msg({
          message: "failed to save request",
          type: 'error',
        });
        return;
      }

      let index = this.state.activeInstanceId;
      if (this.state.needsSave) {
        index = this.state.servers.push(result);
        index -= 1;
      } else {
        this.state.servers[index] = result;
      }

      this.setState({
        needsSave: false,
        activeInstanceId: index,
        activeInstance: { ...this.state.servers[index] },
      });

      this.props.msg({
        message: 'Sonarr settings saved!',
        type: 'good',
      });
    } catch (e) {
      this.props.msg({
        message: e.message,
        type: 'error',
      });
    }
  }

  async deleteServer() {
    const id = this.state.activeInstanceId;
    let servers = this.state.servers;
    let res = await Api.sonarrDeleteInstance(servers[id].id);
    if (res.status == 'error') {
      this.props.msg({
        message: res.error,
        type: 'error',
      });
      return;
    }

    this.state.servers.splice(id, 1);

    this.closeModal('addServer');
    this.closeWizard();

    this.props.msg({
      message: res.message,
      type: 'good',
    });
  }

  inputChange(e) {
    const target = e.target;
    const name = target.name;
    let value = target.value;

    let server = this.state.activeInstance;

    if (target.type === 'checkbox') {
      value = target.checked;
    }

    if (target.type === 'select-one') {
      switch (name) {
        case "protocol": {
          server.protocol = value;
          break;
        }
        case "profile": {
          server.profile = parseInt(value, 10);
          break;
        }
        case "path": {
          server.path = parseInt(value, 10);
          break;
        }
        case "language": {
          server.language = parseInt(value, 10);
          break;
        }
        case "availability": {
          server.availability = parseInt(value, 10);
          break;
        }
      }
    } else {
      server = {
        ...server,
        [name]: name === "port" ? parseInt(value) : value,
      };
    }

    this.setState({
      activeInstance: server,
    });
  }

  async getSonarr(live = false) {
    this.setState({
      loading: live ? false : true,
    });
    try {
      const servers = await Api.sonarrConfig({
        withPaths: true,
        withProfiles: true,
        withLanguages: true,
        withAvailabilities: true,
        withTags: false,
      });
      this.setState({
        servers,
        loading: false,
      });
    } catch (err) {
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
      const activeInstance = { ...this.state.servers[id] };
      this.setState({
        activeInstance,
        editWizardOpen: true,
        activeInstanceId: id,
        needsSave: false,
      });
    } else {
      this.setState({
        activeInstance: makeSonarr(),
        wizardOpen: true,
        activeInstanceId: id,
        needsSave: true,
      });
    }
  }

  closeWizard() {
    this.setState({
      wizardOpen: false,
      editWizardOpen: false,
      activeInstanceId: 0,
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
      wizardOpen: false,
      editWizardOpen: false,
      activeInstanceId: 0,
    });
  }

  renderServers(servers) {
    return (
      servers.map((server, i) => {
        const id = server.id ? server.id : 'Error';
        const enabled = server.enabled ? 'Enabled' : 'Disabled';

        let profile = 'No set';
        if (server.profiles) {
          const pfl = server.profiles.filter((p) => p.id === server.profile)[0];
          profile = pfl ? pfl.name : server.profiles[0].name;
        }

        let path = 'Not set';
        if (server.paths) {
          const pa = server.paths.filter((p) => p.id === server.path)[0];
          path = pa ? pa.path : server.paths[0].path;
        }

        let language = 'Not set';
        if (server.languages) {
          const la = server.languages.filter((p) => p.id === server.language)[0];
          language = la ? la.name : server.languages[0].name;
        }

        let availability = 'Not set';
        if (server.availabilities) {
          const av = server.availabilities.filter((a) => a.id === server.availability)[0];
          availability = av ? av.name : server.availabilities[0].name;
        }

        return (
          <div key={id} className="sr--instance">
            <div className="sr--instance--inner">
              <ServerIcon />
              <p className="sr--title">{server.name}</p>
              <p>{`${server.protocol}://${server.host}:${server.port}`}</p>
              <p>Status: {enabled}</p>
              <p>Profile: {profile}</p>
              <p>Path: {path}</p>
              <p>Language: {language}</p>
              <p>Type: {availability}</p>
              <p className="small">
                ID: {id}
              </p>
              <div className="btn-wrap">
                <button
                  className="btn btn__square"
                  onClick={() => {
                    this.openModal('addServer');
                    this.openWizard(i);
                  }}
                >
                  Edit
                </button>
              </div>
            </div>
          </div>
        );
      })
    )
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

    let server = this.state.activeInstance;
    let profile = 0;
    if (server.profiles && server.profiles.length) {
      const pfl = server.profiles.filter((p) => p.id === server.profile)[0];
      profile = pfl ? pfl.id : server.profiles[0].id;
    }

    let path = 0;
    if (server.paths && server.paths.length) {
      const pa = server.paths.filter((p) => p.id === server.path)[0];
      path = pa ? pa.id : server.paths[0].id;
    }

    let language = 0;
    if (server.languages && server.languages.length) {
      const la = server.languages.filter((p) => p.id === server.language)[0];
      language = la ? la.id : server.languages[0].id;
    }

    let availability = 0;
    if (server.availabilities && server.availabilities.length) {
      const av = server.availabilities.filter((a) => a.id === server.availability)[0];
      availability = av ? av.id : server.availabilities[0].id;
    }

    return (
      <>
        <Modal
          title="Add new server"
          open={this.state.addServerOpen}
          submitText="Save"
          closeText="Close"
          submit={() => this.saveServer()}
          close={() => this.closeModal('addServer')}
          delete={
            this.state.needsSave
              ? false
              : () => {
                this.deleteServer();
                this.closeModal('addServer');
              }
          }
        >
          <label>Name</label>
          <input
            className="styled-input--input"
            type="text"
            name="name"
            value={server?.name}
            onChange={this.inputChange}
          />
          <label>Protocol</label>
          <div className="styled-input--select">
            <select
              name="protocol"
              value={server?.protocol}
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
            value={server?.host}
            onChange={this.inputChange}
          />
          <label>Port</label>
          <input
            className="styled-input--input frt"
            type="number"
            name="port"
            value={server?.port}
            onChange={this.inputChange}
          />
          <label>URL Base</label>
          <input
            className="styled-input--input frt"
            type="text"
            name="subpath"
            value={server?.subpath}
            onChange={this.inputChange}
          />
          <label>Token</label>
          <input
            className="styled-input--input frt"
            type="text"
            name="token"
            value={server?.token}
            onChange={this.inputChange}
          />
          {!this.state.needsSave ? (
            <>
              <label>Profile</label>
              <div
                className={`styled-input--select ${server?.profiles ? '' : 'disabled'
                  }`}
              >
                <select
                  name="profile"
                  value={profile}
                  onChange={this.inputChange}
                >
                  {server?.profiles ? (
                    <>
                      <option value="">Choose an option</option>
                      {server.profiles.map((item) => {
                        return (
                          <option key={`p__${item.id}`} value={item.id}>
                            {item.name}
                          </option>
                        );
                      })}
                    </>
                  ) : (
                    <option value="">
                      {'Loading...'}
                    </option>
                  )}
                </select>
              </div>
            </>
          ) : <></>}
          {!this.state.needsSave ? (
            <>
              <label>Path</label>
              <div
                className={`styled-input--select ${server?.profiles ? '' : 'disabled'
                  }`}
              >
                <select
                  name="path"
                  value={path}
                  onChange={this.inputChange}
                >
                  {server?.paths ? (
                    <>
                      <option value="">Choose an option</option>
                      {server.paths.map((item) => {
                        return (
                          <option key={`pp__${item.id}`} value={item.id}>
                            {item.path}
                          </option>
                        );
                      })}
                    </>
                  ) : (
                    <option value="">
                      {'Loading...'}
                    </option>
                  )}
                </select>
              </div>
            </>) : <></>}
          {!this.state.needsSave ? (
            <>
              <label>Language</label>
              <div
                className={`styled-input--select ${server?.languages ? '' : 'disabled'
                  }`}
              >
                <select
                  name="language"
                  value={language}
                  onChange={this.inputChange}
                >
                  {server?.languages ? (
                    <>
                      <option value="">Choose an option</option>
                      {server.languages.map((item) => {
                        return (
                          <option key={`pp__${item.id}`} value={item.id}>
                            {item.name}
                          </option>
                        );
                      })}
                    </>
                  ) : (
                    <option value="">
                      {'Loading...'}
                    </option>
                  )}
                </select>
              </div>
            </>) : <></>}
            {!this.state.needsSave ? (
            <>
              <label>Series Type</label>
              <div
                className={`styled-input--select ${server?.availabilities ? '' : 'disabled'
                  }`}
              >
                <select
                  name="availability"
                  value={availability}
                  onChange={this.inputChange}
                >
                  {server?.availabilities ? (
                    <>
                      <option value="">Choose an option</option>
                      {server.availabilities.map((item) => {
                        return (
                          <option key={`pp__${item.id}`} value={item.id}>
                            {item.name}
                          </option>
                        );
                      })}
                    </>
                  ) : (
                    <option value="">
                      {'Loading...'}
                    </option>
                  )}
                </select>
              </div>
            </>) : <></>}
          {!this.state.needsSave ? (
            <div className="checkbox-wrap mb--2">
              <input
                type="checkbox"
                name="enabled"
                checked={server?.enabled}
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
            { this.renderServers(this.state.servers) }
            <div className="sr--instance sr--add-new">
              <div
                className="sr--instance--inner"
                onClick={() => {
                  this.openModal('addServer');
                  this.openWizard(this.state.servers.length || 0);
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
