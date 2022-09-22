import { useEffect, useState } from 'react';

import { ReactComponent as ServerIcon } from '../../assets/svg/server.svg';
import {
  deleteRadarr,
  deleteSonarr,
  getRadarr,
  getRadarrOptions,
  getSonarr,
  getSonarrOptions,
  saveRadarrConfig,
  saveSonarrConfig,
  testRadarr,
  testSonarr,
} from '../../services/config.service';
import buttons from '../../styles/components/button.module.scss';
import inputs from '../../styles/components/input.module.scss';
import typo from '../../styles/components/typography.module.scss';
import styles from '../../styles/views/adminSettings.module.scss';

export default function SettingsArr(props) {
  const [servers, setServers] = useState([]);
  const [openAdd, setOpenAdd] = useState(false);
  const serverDefaults = {
    id: null,
    name: '',
    host: '',
    port: '',
    protocol: 'http',
    token: '',
    subpath: '',
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
    enabled: false,
  };
  const [newServer, setNewServer] = useState(serverDefaults);
  const [currentServer, setCurrentServer] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [options, setOptions] = useState({
    profiles: false,
    paths: false,
    languages: false,
  });
  const type = props.type;

  useEffect(() => {
    closeModal();
    setServers([]);
    getServers();
    //eslint-disable-next-line
  }, [type]);

  async function getServers() {
    try {
      const servers = type === 'radarr' ? await getRadarr() : await getSonarr();
      setServers(servers);
      return servers;
    } catch (e) {
      console.log(e);
      props.newNotification({
        message: 'Failed to Load Servers',
        type: 'error',
      });
      return;
    }
  }

  function handleChange(e) {
    const target = e.target;
    const name = target.name;
    let value = target.value;
    if (target.type === 'checkbox') {
      value = target.checked;
    }
    if (!currentServer) {
      setNewServer({
        ...newServer,
        [name]: value,
      });
    } else {
      if (name === 'profile') {
        const profile = options.profiles.filter((o) => o.id == value);
        setCurrentServer({
          ...currentServer,
          profile: {
            id: parseInt(value),
            name: profile[0].name,
          },
        });
      } else if (name === 'path') {
        const path = options.paths.filter((o) => o.id == value);
        setCurrentServer({
          ...currentServer,
          path: {
            id: parseInt(value),
            location: path[0].path,
          },
        });
      } else if (name === 'language') {
        const language = options.languages.filter((o) => o.id == value);
        setCurrentServer({
          ...currentServer,
          language: {
            id: parseInt(value),
            name: language[0].name,
          },
        });
      } else {
        setCurrentServer({
          ...currentServer,
          [name]: value,
        });
      }
    }
  }

  async function addServer() {
    if (updating) return;
    setUpdating(true);
    let failed = false;
    let serverData = null;

    if (
      !newServer.name ||
      !newServer.token ||
      !newServer.host ||
      !newServer.port ||
      !newServer.protocol ||
      !newServer.subpath
    ) {
      props.newNotification({
        message: 'Please complete all required fields',
        type: 'error',
      });
      setUpdating(false);
      return;
    }
    const n = props.newNotification({
      message: 'Adding server',
      type: 'loading',
    });
    try {
      let data = [...servers];

      data.push({
        ...newServer,
      });
      let responseData = null;
      if (type === 'radarr') {
        responseData = await saveRadarrConfig(data);
      } else {
        responseData = await saveSonarrConfig(data);
      }
      serverData = {
        ...data[data.length - 1],
        id: responseData[responseData.length - 1].id,
      };
      const test = await testServer(serverData.id);
      if (!test) {
        failed = true;
      } else {
        setNewServer(serverData);
      }
    } catch (e) {
      failed = true;
      console.log(e);
      props.newNotification({
        message: 'Failed to add server',
        type: 'error',
        id: n,
      });
    }
    if (failed) {
      props.newNotification({
        message: 'Failed to add server',
        type: 'error',
        id: n,
      });
      try {
        if (type === 'radarr') {
          await saveRadarrConfig(servers);
        } else {
          await saveSonarrConfig(servers);
        }
      } catch (e) {
        console.log(e);
      }
      setUpdating(false);
    } else {
      await getServers();

      setCurrentServer({
        ...serverData,
      });
      getSettings(serverData.id);

      setUpdating(false);
      props.newNotification({
        message: 'Server added',
        type: 'success',
        id: n,
      });
    }
  }

  async function testServer(id) {
    const n = props.newNotification({
      message: 'Testing server',
      type: 'loading',
    });
    try {
      const test =
        type === 'radarr' ? await testRadarr(id) : await testSonarr(id);
      if (!test.connection) throw 'Test Failed';
      props.newNotification({
        message: 'Server test passed',
        type: 'success',
        id: n,
      });
      return true;
    } catch (e) {
      props.newNotification({
        message: 'Server test failed',
        type: 'error',
        id: n,
      });
      return false;
    }
  }

  function selectServer(id) {
    const server = servers.filter((s) => s.id === id);
    if (server.length > 0) {
      setCurrentServer(server[0]);
      getSettings(id);
    }
  }

  async function getSettings(id) {
    try {
      let settings =
        type === 'radarr'
          ? await getRadarrOptions(id)
          : await getSonarrOptions(id);
      if (settings.profiles.error || settings.paths.error) {
        return;
      }
      setOptions({
        profiles: settings.profiles.length > 0 ? settings.profiles : false,
        paths: settings.paths.length > 0 ? settings.paths : false,
        languages: settings.languages,
      });
    } catch (e) {
      console.log(e);
      setOptions({
        profiles: false,
        paths: false,
        languages: false,
      });
      return;
    }
  }

  function closeModal() {
    setOpenAdd(false);
    setCurrentServer(false);
    setNewServer(serverDefaults);
    setOptions({
      profiles: false,
      paths: false,
      languages: false,
    });
  }

  async function deleteServer(id) {
    if (updating) return;
    setUpdating(true);
    const n = props.newNotification({
      message: 'Removing server',
      type: 'loading',
    });
    closeModal();
    try {
      if (type === 'radarr') {
        await deleteRadarr(id);
      } else {
        await deleteSonarr(id);
      }

      await getServers();
      props.newNotification({
        message: 'Server removed',
        type: 'success',
        id: n,
      });
      setUpdating(false);
    } catch (e) {
      console.log(e);
      props.newNotification({
        message: 'Failed to remove server',
        type: 'error',
        id: n,
      });
      setUpdating(false);
    }
  }

  async function updateServer(id) {
    if (updating) return;
    setUpdating(true);
    const n = props.newNotification({
      message: 'Updating server',
      type: 'loading',
    });
    try {
      let data = [...servers];
      data.forEach((s, i) => {
        if (s.id === id) {
          data[i] = currentServer;
        }
      });

      if (type === 'radarr') {
        await saveRadarrConfig(data);
      } else {
        await saveSonarrConfig(data);
      }
      await getServers();
      props.newNotification({
        message: 'Server updated',
        type: 'success',
        id: n,
      });
      closeModal();
      setUpdating(false);
    } catch (e) {
      console.log(e);
      closeModal();
      props.newNotification({
        message: 'Failed to update server',
        type: 'error',
        id: n,
      });
      setUpdating(false);
    }
  }

  return (
    <div className={styles.arr__wrap}>
      <p className={`${typo.smtitle} ${typo.bold}`}>
        {type === 'radarr' ? 'Radarr' : 'Sonarr'}
      </p>
      <br />
      {type === 'radarr' ? (
        <p className={`${typo.body}`}>
          Connect Radarr to Petio to allow Radarr to automatically process your
          movie requests. <br />
          More information about Radarr can be found{' '}
          <a
            href="https://radarr.video/"
            className={typo.link}
            target="_blank"
            rel="noreferrer"
          >
            here
          </a>
        </p>
      ) : (
        <p className={`${typo.body}`}>
          Connect Sonarr to Petio to allow Sonarr to automatically process your
          TV requests. <br />
          More information about Sonarr can be found{' '}
          <a
            href="https://sonarr.tv/"
            className={typo.link}
            target="_blank"
            rel="noreferrer"
          >
            here
          </a>
        </p>
      )}
      <br />
      <p className={`${typo.smtitle} ${typo.bold}`}>Servers</p>
      <br />
      <div className={styles.grid}>
        {servers && servers.length > 0
          ? servers.map((server, i) => {
              return (
                <div
                  className={`${styles.arr__item} ${
                    server.enabled
                      ? styles.arr__item__active
                      : styles.arr__item__disabled
                  }`}
                  key={`${type}_server__${i}`}
                  onClick={() => selectServer(server.id)}
                >
                  <div className={styles.arr__item__content}>
                    <div className={styles.arr__item__icon}>
                      <ServerIcon />
                    </div>
                    <div>
                      <p
                        className={`${typo.body} ${typo.uppercase} ${typo.medium}`}
                      >
                        {server.name} (
                        {server.enabled ? 'active' : 'not active'})
                      </p>
                      <p
                        className={`${typo.xsmall} ${typo.uppercase} ${typo.medium}`}
                      >
                        {server.id}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          : null}
        <div className={styles.arr__add} onClick={() => setOpenAdd(true)}>
          <div className={styles.arr__item__content}>
            <div className={styles.arr__item__icon}>
              <ServerIcon />
            </div>
            <div>
              <p className={`${typo.body} ${typo.uppercase} ${typo.medium}`}>
                Add new server
              </p>
              <p
                className={`${typo.xsmall} ${typo.uppercase} ${typo.medium}`}
              ></p>
            </div>
          </div>
        </div>
      </div>
      {openAdd || currentServer ? (
        <div className={styles.arr__modal__wrap}>
          <div className={styles.arr__modal}>
            <div className={styles.arr__modal__close}>
              <p
                className={`${typo.small} ${typo.uppercase} ${typo.medium}`}
                onClick={closeModal}
              >
                Close
              </p>
            </div>
            <div className={styles.arr__modal__title}>
              <p className={`${typo.small} ${typo.uppercase} ${typo.medium}`}>
                {currentServer ? 'Edit Server' : 'Add New Server'}
              </p>
            </div>
            <div className={styles.arr__modal__content}>
              <p className={`${typo.xsmall} ${typo.uppercase} ${typo.medium}`}>
                Title
              </p>
              <input
                type="text"
                className={inputs.text__light}
                placeholder="Title"
                name="name"
                value={currentServer ? currentServer.name : newServer.name}
                onChange={handleChange}
              />
              <br />
              <p className={`${typo.xsmall} ${typo.uppercase} ${typo.medium}`}>
                Protocol
              </p>
              <select
                className={inputs.select__light}
                name="protocol"
                value={
                  currentServer ? currentServer.protocol : newServer.protocol
                }
                onChange={handleChange}
              >
                <option value="http">http</option>
                <option value="https">https</option>
              </select>
              <br />
              <p className={`${typo.xsmall} ${typo.uppercase} ${typo.medium}`}>
                Host
              </p>
              <input
                type="text"
                className={inputs.text__light}
                placeholder="Hostname (e.g localhost)"
                name="host"
                value={currentServer ? currentServer.host : newServer.host}
                onChange={handleChange}
              />
              <br />
              <p className={`${typo.xsmall} ${typo.uppercase} ${typo.medium}`}>
                Port
              </p>
              <input
                type="number"
                className={inputs.text__light}
                placeholder="eg. 7878"
                name="port"
                value={currentServer ? currentServer.port : newServer.port}
                onChange={handleChange}
              />
              <br />
              <p className={`${typo.xsmall} ${typo.uppercase} ${typo.medium}`}>
                Base URL
              </p>
              <input
                type="text"
                className={inputs.text__light}
                placeholder={`/ or /${type} etc`}
                name="subpath"
                value={
                  currentServer ? currentServer.subpath : newServer.subpath
                }
                onChange={handleChange}
              />
              <br />
              <p className={`${typo.xsmall} ${typo.uppercase} ${typo.medium}`}>
                Apikey
              </p>
              <input
                type="text"
                className={inputs.text__light}
                placeholder={`API Key from ${
                  type === 'radarr' ? 'Radarr' : 'Sonarr'
                }`}
                name="token"
                value={currentServer ? currentServer.token : newServer.token}
                onChange={handleChange}
              />
              <br />
              {currentServer ? (
                <>
                  <p
                    className={`${typo.xsmall} ${typo.uppercase} ${typo.medium}`}
                  >
                    Default Profile
                  </p>
                  <select
                    className={inputs.select__light}
                    name="profile"
                    value={currentServer.profile.id || ''}
                    onChange={handleChange}
                  >
                    {options.profiles && options.profiles.length > 0 ? (
                      <>
                        <option value="">Please select</option>
                        {options.profiles.map((profile) => {
                          return (
                            <option key={profile.id} value={profile.id}>
                              {profile.name}
                            </option>
                          );
                        })}
                      </>
                    ) : (
                      <option value="">Loading</option>
                    )}
                  </select>
                  <br />
                  <p
                    className={`${typo.xsmall} ${typo.uppercase} ${typo.medium}`}
                  >
                    Default Path
                  </p>
                  <select
                    className={inputs.select__light}
                    name="path"
                    value={currentServer.path.id || ''}
                    onChange={handleChange}
                  >
                    {options.paths && options.paths.length ? (
                      <>
                        <option value="">Please select</option>
                        {options.paths.map((path) => {
                          return (
                            <option key={path.id} value={path.id}>
                              {path.path}
                            </option>
                          );
                        })}
                      </>
                    ) : (
                      <option value="">Loading</option>
                    )}
                  </select>
                  <br />
                  <p
                    className={`${typo.xsmall} ${typo.uppercase} ${typo.medium}`}
                  >
                    Default Language
                  </p>
                  <select
                    className={inputs.select__light}
                    name="language"
                    data-value={currentServer.language.id}
                    value={currentServer.language.id}
                    onChange={handleChange}
                  >
                    {options.languages && options.languages.length ? (
                      <>
                        <option value="">Please select</option>
                        {options.languages.map((language) => {
                          return (
                            <option key={language.id} value={language.id}>
                              {language.name}
                            </option>
                          );
                        })}
                      </>
                    ) : (
                      <option value="">Loading</option>
                    )}
                  </select>
                  <br />
                  <div className={inputs.checkboxes}>
                    <div className={inputs.checkboxes__item}>
                      <input
                        type="checkbox"
                        name="enabled"
                        checked={currentServer.enabled}
                        onChange={handleChange}
                      />
                      <p className={`${typo.body}`}>Enabled</p>
                    </div>
                  </div>
                  <br />
                </>
              ) : null}
              {currentServer ? (
                <>
                  <button
                    className={buttons.primary__red}
                    onClick={() => deleteServer(currentServer.id)}
                  >
                    Delete
                  </button>
                  <br />
                  <button
                    className={`${buttons.secondary}`}
                    onClick={() => testServer(currentServer.id)}
                  >
                    Test
                  </button>
                  <br />
                  <button
                    className={`${buttons.primary} ${
                      currentServer.path.id && currentServer.profile.id
                        ? ''
                        : buttons.disabled
                    }`}
                    onClick={() => updateServer(currentServer.id)}
                  >
                    Save
                  </button>
                </>
              ) : (
                <button className={buttons.primary} onClick={addServer}>
                  Add
                </button>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
