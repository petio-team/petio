import React from 'react';

import { ReactComponent as Add } from '../../assets/svg/plus-circle.svg';
import { ReactComponent as ServerIcon } from '../../assets/svg/server.svg';
import { ReactComponent as Spinner } from '../../assets/svg/spinner.svg';
import Modal from '../../components/Modal';
import Api from '../../data/Api';

class Sonarr extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      servers: [],
      loading: true,
      isError: false,
      isMsg: false,
      wizardOpen: false,
      enabled: false,
      name: '',
      protocol: 'http',
      host: 'localhost',
      port: 8989,
      profile: {
        id: 0,
        name: '',
      },
      path: {
        id: 0,
        location: '',
      },
      language: {
        id: 0,
        name: '',
      },
      media_type: {
        id: 0,
        name: '',
      },
      subpath: '/',
      token: '',
      activeServer: false,
      id: '',
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

  async saveServer() {
    if (this.state.activeServer === false) {
      return;
    }

    const servers = this.state.servers;
    servers[this.state.activeServer] = {
      enabled: this.state.enabled,
      name: this.state.name,
      protocol: this.state.protocol,
      host: this.state.host,
      token: this.state.token,
      port: this.state.port,
      subpath: this.state.subpath === '/' ? '/' : this.state.subpath,
      path: {
        id: this.state.path.id,
        location: this.state.path.location,
      },
      profile: {
        id: this.state.profile.id,
        name: this.state.profile.name,
      },
      language: {
        id: this.state.language.id,
        name: this.state.language.name,
      },
      media_type: {
        id: this.state.media_type.id,
        name: this.state.media_type.name,
      },
    };

    try {
      const resp = await Api.saveSonarrConfig(servers);
      if (resp.error) {
        throw new Error(resp.error);
      }

      const id = resp[0].id;
      this.state.id = id;
      this.state.servers[this.state.activeServer].id = id;

      await this.getSettings(id);

      this.setState({
        newServer: false,
        needsTest: false,
      });
    } catch (e) {
      console.log('failed to save sonarr settings: ', e);
      this.props.msg({
        message: e.message,
        type: 'error',
      });
    }

    this.props.msg({
      message: 'Sonarr settings saved!',
      type: 'good',
    });
  }

  async deleteServer(silent = false) {
    if (this.state.activeServer === false) {
      this.props.msg({
        message: 'something went wrong',
        type: 'error',
      });
      return;
    }

    let servers = this.state.servers;

    let res = await Api.sonarrDeleteInstance(
      servers[this.state.activeServer].id,
    );
    if (res.status == 'error') {
      this.props.msg({
        message: res.error,
        type: 'error',
      });
      return;
    }

    servers.splice(this.state.activeServer, 1);
    this.getSonarr(true);

    if (!silent) {
      this.closeModal('addServer');
      this.closeWizard();

      this.props.msg({
        message: res.message,
        type: 'good',
      });
    }
  }

  async test(id, add = false) {
    console.log('test id: ', id);
    if (!this.state.subpath.startsWith('/') && this.state.subpath.length > 0) {
      this.setState({
        subpath: '/' + this.state.subpath,
      });
      setTimeout(() => {
        this.test(id, add);
      }, 1000);
      return;
    }
    if (add) {
      await this.saveServer();
    }
    try {
      let result = await Api.testSonarr(id);
      if (result.connection) {
        this.setState({
          newServer: false,
          needsTest: false,
        });
        this.props.msg({
          message: 'Sonarr Test Connection success!',
          type: 'good',
        });
        await this.getSonarr(true);
        await this.getSettings(id);
      } else {
        this.props.msg({
          message: 'Sonarr Test Connection failed!',
          type: 'error',
        });
        this.deleteServer(true);
      }
    } catch (err) {
      this.props.msg({
        message: 'Sonarr Test Connection failed! Error 2',
        type: 'error',
      });
    }
  }

  inputChange(e) {
    const target = e.target;
    const name = target.name;
    let value = target.value;

    if (target.classList.contains('frt')) {
      this.setState({
        needsTest: true,
        enabled: false,
      });
    }

    if (target.type === 'checkbox') {
      value = target.checked;
    }

    if (target.type === 'select-one') {
      let title = target.options[target.selectedIndex].text;
      if (this.state[name] instanceof Object) {
        this.setState({
          [`${name}`]: {
            id: parseInt(value),
            [this.state[name].name != undefined ? 'name' : 'location']: title,
          },
        });
      } else {
        this.setState({
          [name]: value,
        });
      }
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
        enabled: this.state.servers[id].enabled,
        name: this.state.servers[id].name,
        protocol: this.state.servers[id].protocol,
        host: this.state.servers[id].host,
        port: this.state.servers[id].port,
        subpath: this.state.servers[id].subpath,
        token: this.state.servers[id].token,
        profile: {
          id: this.state.servers[id].profile.id,
          name: this.state.servers[id].profile.name,
        },
        path: {
          id: this.state.servers[id].path.id,
          location: this.state.servers[id].path.location,
        },
        language: {
          id: this.state.servers[id].language.id,
          name: this.state.servers[id].language.name,
        },
        media_type: {
          id: this.state.servers[id].media_type.id,
          name: this.state.servers[id].media_type.name,
        },
        id: this.state.servers[id].id,
        needsTest: false,
      });
      this.getSettings(this.state.servers[id].id);
    } else {
      this.setState({
        newServer: true,
        wizardOpen: true,
        activeServer: id,
        id: '',
        needsTest: true,
      });
    }
  }

  closeWizard() {
    this.setState({
      enabled: false,
      name: '',
      protocol: 'http',
      host: 'localhost',
      port: 8989,
      subpath: '/',
      token: '',
      profiles: false,
      paths: false,
      path: {
        id: 0,
        location: '',
      },
      profile: {
        id: 0,
        name: '',
      },
      language: {
        id: 0,
        name: '',
      },
      media_type: {
        id: 0,
        name: '',
      },
      wizardOpen: false,
      editWizardOpen: false,
      activeServer: false,
      id: '',
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
      name: '',
      protocol: 'http',
      host: 'localhost',
      port: null,
      subpath: '/',
      token: '',
      profiles: false,
      paths: false,
      path: {
        id: 0,
        location: '',
      },
      profile: {
        id: 0,
        name: '',
      },
      language: {
        id: 0,
        name: '',
      },
      media_type: {
        id: 0,
        name: '',
      },
      wizardOpen: false,
      editWizardOpen: false,
      activeServer: false,
      id: '',
    });
  }

  async getSettings(id) {
    try {
      let settings = await Api.sonarrOptions(id);
      if (settings.profiles.error || settings.paths.error) {
        return;
      }
      if (this.state.id === id)
        this.setState({
          profiles: settings.profiles.length > 0 ? settings.profiles : false,
          paths: settings.paths.length > 0 ? settings.paths : false,
          languages: settings.languages.length > 0 ? settings.languages : false,
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
          submit={this.saveServer}
          close={() => this.closeModal('addServer')}
          delete={
            this.state.newServer
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
            value={this.state.name}
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
            value={this.state.port ? this.state.port : 8989}
            onChange={this.inputChange}
          />
          <label>URL Base</label>
          <input
            className="styled-input--input frt"
            type="text"
            name="subpath"
            value={this.state.subpath ? this.state.subpath : '/'}
            onChange={this.inputChange}
          />
          <label>Token</label>
          <input
            className="styled-input--input frt"
            type="text"
            name="token"
            value={this.state.token ? this.state.token : ''}
            onChange={this.inputChange}
          />
          <label>Profile</label>
          <div
            className={`styled-input--select ${
              this.state.profiles || this.state.needsTest ? '' : 'disabled'
            }`}
          >
            <select
              name="profile"
              value={this.state.profile.id}
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
                    ? 'Please save the connection'
                    : 'Loading...'}
                </option>
              )}
            </select>
          </div>
          <label>Path</label>
          <div
            className={`styled-input--select ${
              this.state.profiles || this.state.needsTest ? '' : 'disabled'
            }`}
          >
            <select
              name="path"
              value={this.state.path.id}
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
                    ? 'Please save the connection'
                    : 'Loading...'}
                </option>
              )}
            </select>
          </div>
          <label>Language</label>
          <div
            className={`styled-input--select ${
              this.state.languages || this.state.needsTest ? '' : 'disabled'
            }`}
          >
            <select
              name="language"
              value={this.state.language.id}
              onChange={this.inputChange}
            >
              {this.state.languages && !this.state.needsTest ? (
                <>
                  <option value="">Choose an option</option>
                  {this.state.languages.map((item) => {
                    return (
                      <option key={`pp__${item.id}`} value={item.id}>
                        {item.name}
                      </option>
                    );
                  })}
                </>
              ) : (
                <option value="">
                  {this.state.newServer || this.state.needsTest
                    ? 'Please save the connection'
                    : 'Loading...'}
                </option>
              )}
            </select>
          </div>
          {!this.state.newServer &&
          this.state.path.id != null &&
          this.state.profile.id != null &&
          !this.state.needsTest ? (
            <div className="checkbox-wrap mb--2">
              <input
                type="checkbox"
                name="enabled"
                checked={this.state.enabled}
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
                <div key={server.id} className="sr--instance">
                  <div className="sr--instance--inner">
                    <ServerIcon />
                    <p className="sr--title">{server.name}</p>
                    <p>{`${server.protocol}://${server.host}:${server.port}`}</p>
                    <p>Status: {server.enabled ? 'Enabled' : 'Disabled'}</p>
                    <p>
                      Profile:{' '}
                      {server.profile.name != ''
                        ? server.profile.name
                        : 'Not set'}
                    </p>
                    <p>
                      Path:{' '}
                      {server.path.location != ''
                        ? server.path.location
                        : 'Not set'}
                    </p>
                    <p>
                      Language:{' '}
                      {server.language.name != ''
                        ? server.language.name
                        : 'Not set'}
                    </p>
                    <p className="small">
                      ID: {server.id ? server.id : 'Error'}
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
            })}
            <div className="sr--instance sr--add-new">
              <div
                className="sr--instance--inner"
                onClick={() => {
                  this.openModal('addServer');
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
