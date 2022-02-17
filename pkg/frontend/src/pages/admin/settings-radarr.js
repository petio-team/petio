import styles from "../../styles/views/adminSettings.module.scss";
import typo from "../../styles/components/typography.module.scss";
import inputs from "../../styles/components/input.module.scss";
import buttons from "../../styles/components/button.module.scss";
import { ReactComponent as ServerIcon } from "../../assets/svg/server.svg";
import { useState, useEffect } from "react";
import {
  getRadarr,
  getRadarrOptions,
  saveRadarrConfig,
  testRadarr,
} from "../../services/config.service";
import { v4 as uuidv4 } from "uuid";

export default function SettingsRadarr(props) {
  const [servers, setServers] = useState([]);
  const [openAdd, setOpenAdd] = useState(false);
  const serverDefaults = {
    enabled: false,
    key: "",
    host: "",
    port: "",
    protocol: "http",
    title: "",
    subpath: "",
    uuid: false,
    path: {
      id: null,
      location: null,
    },
    profile: {
      id: null,
      name: null,
    },
  };
  const [newServer, setNewServer] = useState(serverDefaults);
  const [currentServer, setCurrentServer] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [options, setOptions] = useState({
    profiles: false,
    paths: false,
  });

  useEffect(() => {
    getServers();
    //eslint-disable-next-line
  }, []);

  async function getServers() {
    try {
      const servers = await getRadarr();
      setServers(servers);
      return servers;
    } catch (e) {
      console.log(e);
      props.newNotification({
        message: "Failed to Load Servers",
        type: "error",
      });
      return;
    }
  }

  function handleChange(e) {
    const target = e.target;
    const name = target.name;
    const value = target.value;
    if (!currentServer) {
      setNewServer({
        ...newServer,
        [name]: value,
      });
    } else {
      if (name === "profile") {
        const profile = options.profiles.filter((o) => o.id == value);
        setCurrentServer({
          ...currentServer,
          profile: {
            id: value,
            name: profile[0].name,
          },
        });
      } else if (name === "path") {
        const path = options.paths.filter((o) => o.id == value);
        setCurrentServer({
          ...currentServer,
          path: {
            id: value,
            location: path[0].path,
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
    const uuid = uuidv4();
    let failed = false;
    if (
      !newServer.title ||
      !newServer.key ||
      !newServer.host ||
      !newServer.port ||
      !newServer.protocol ||
      !newServer.subpath
    ) {
      props.newNotification({
        message: "Please complete all required fields",
        type: "error",
      });
      setUpdating(false);
      return;
    }
    const n = props.newNotification({
      message: "Adding server",
      type: "loading",
    });
    try {
      let data = [...servers];

      data.push({
        ...newServer,
        uuid: uuid,
      });
      await saveRadarrConfig(data);
      const test = await testServer(uuid);
      if (!test) failed = true;
    } catch (e) {
      failed = true;
      console.log(e);
      props.newNotification({
        message: "Failed to add server",
        type: "error",
        id: n,
      });
    }
    if (failed) {
      props.newNotification({
        message: "Failed to add server",
        type: "error",
        id: n,
      });
      try {
        await saveRadarrConfig(servers);
      } catch (e) {
        console.log(e);
      }
      setUpdating(false);
    } else {
      await getServers();

      setCurrentServer(newServer);

      setUpdating(false);
      props.newNotification({
        message: "Server added",
        type: "success",
        id: n,
      });
    }
  }

  async function testServer(uuid) {
    const n = props.newNotification({
      message: "Testing server",
      type: "loading",
    });
    try {
      const test = await testRadarr(uuid);
      if (!test.connection) throw "Test Failed";
      props.newNotification({
        message: "Server test passed",
        type: "success",
        id: n,
      });
      return true;
    } catch (e) {
      console.log(e);
      props.newNotification({
        message: "Server test failed",
        type: "error",
        id: n,
      });
      return false;
    }
  }

  function selectServer(uuid) {
    const server = servers.filter((s) => s.uuid === uuid);
    if (server.length > 0) {
      setCurrentServer(server[0]);
      getSettings(uuid);
    }
  }

  async function getSettings(uuid) {
    try {
      let settings = await getRadarrOptions(uuid);
      if (settings.profiles.error || settings.paths.error) {
        return;
      }
      setOptions({
        profiles: settings.profiles.length > 0 ? settings.profiles : false,
        paths: settings.paths.length > 0 ? settings.paths : false,
      });
    } catch (e) {
      console.log(e);
      setOptions({
        profiles: false,
        paths: false,
      });
      return;
    }
  }

  return (
    <div className={styles.arr__wrap}>
      <p className={`${typo.smtitle} ${typo.bold}`}>Radarr</p>
      <br />
      <p className={`${typo.body}`}>
        Connect Radarr to Petio to allow Radarr to automatically process your
        movie requests. <br />
        More information about Radarr can be found{" "}
        <a
          href="https://radarr.video/"
          className={typo.link}
          target="_blank"
          rel="noreferrer"
        >
          here
        </a>
      </p>
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
                  key={`radarr_server__${i}`}
                  onClick={() => selectServer(server.uuid)}
                >
                  <div className={styles.arr__item__content}>
                    <div className={styles.arr__item__icon}>
                      <ServerIcon />
                    </div>
                    <div>
                      <p
                        className={`${typo.body} ${typo.uppercase} ${typo.medium}`}
                      >
                        {server.title} (
                        {server.enabled ? "active" : "not active"})
                      </p>
                      <p
                        className={`${typo.xsmall} ${typo.uppercase} ${typo.medium}`}
                      >
                        {server.uuid}
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
                onClick={() => {
                  setOpenAdd(false);
                  setCurrentServer(false);
                  setNewServer(serverDefaults);
                  setOptions({
                    profiles: false,
                    paths: false,
                  });
                }}
              >
                Close
              </p>
            </div>
            <div className={styles.arr__modal__title}>
              <p className={`${typo.small} ${typo.uppercase} ${typo.medium}`}>
                {currentServer ? "Edit Server" : "Add New Server"}
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
                name="title"
                value={currentServer ? currentServer.title : newServer.title}
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
                placeholder="/ or /radarr etc"
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
                placeholder="API Key from Radarr"
                name="key"
                value={currentServer ? currentServer.key : newServer.key}
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
                    value={currentServer.profile.id || ""}
                    onChange={handleChange}
                  >
                    {options.paths && options.paths.length ? (
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
                    value={currentServer.path.id || ""}
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
                  <button className={buttons.primary__red}>Delete</button>
                  <br />
                  <button
                    className={`${buttons.primary} ${
                      currentServer.path.id && currentServer.profile.id
                        ? ""
                        : buttons.disabled
                    }`}
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
