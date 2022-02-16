import AdminGridItem from "../../components/adminGridItem";
import styles from "../../styles/views/adminSettings.module.scss";
import typo from "../../styles/components/typography.module.scss";
import buttons from "../../styles/components/button.module.scss";
import inputs from "../../styles/components/input.module.scss";
import oAuthWindow from "../../components/oAuthWindow";
import { plexToken, testPlex } from "../../services/plex.service";
import { connect } from "react-redux";
import { getConfig } from "../../services/config.service";
import { useState, useEffect } from "react";

const mapStateToProps = (state) => {
  return {
    redux_config: state.user.config,
  };
};

function SettingsGeneral(props) {
  const [config, setConfig] = useState(props.redux_config);

  useEffect(() => {
    async function loadConfigs() {
      try {
        const config = await getConfig();
        setConfig(config);
      } catch (err) {
        console.log(err);
        props.newNotification({
          message: "Failed to load config",
          type: "error",
        });
      }
    }

    loadConfigs();
    // eslint-disable-next-line
  }, []);

  async function reAuthPlex() {
    try {
      let plexWindow = oAuthWindow("", "Login with Plex", 500, 500);
      let res = await plexToken(plexWindow);
      if (res.error) {
        throw res.error;
      }
      props.newNotification({
        message: "Authentication Success: Token Renewed",
        type: "success",
      });
    } catch (err) {
      console.log(err);
      props.newNotification({
        message: "Authentication Failed",
        type: "error",
      });
    }
  }

  async function testPlexConnection() {
    const n = props.newNotification({
      message: "Testing Plex Connection",
      type: "loading",
    });
    try {
      let plexConnect = await testPlex();
      if (plexConnect.error) {
        props.newNotification({
          message: "Plex Test Failed",
          type: "error",
          id: n,
        });
      } else {
        props.newNotification({
          message: "Plex Test Passed!",
          type: "success",
          id: n,
        });
      }
    } catch (err) {
      console.log(err);
      props.newNotification({
        message: "Plex Test Failed",
        type: "error",
        id: n,
      });
    }
  }

  function handleChange(e) {
    const target = e.target;
    const inpName = target.name;
    const inpVal = target.value;
    setConfig({
      ...config,
      [inpName]: inpVal,
    });
  }

  if (!config) return null;

  return (
    <div className={styles.grid}>
      <AdminGridItem title="Plex">
        <p className={`${typo.body}`}>
          If Petio starts to experience issues connecting to Plex you can use
          the buttons below to test and attempt to fix the issue. <br />
          Use the test button to test your current Plex connection and use the
          Login with Plex button to re-authenticate Petio if the connection test
          fails.
        </p>
        <br />
        <button
          className={`${buttons.primary} ${!config ? buttons.disabled : ""}`}
          onClick={reAuthPlex}
        >
          Login with Plex
        </button>
        <br />
        <button
          className={`${buttons.primary} ${!config ? buttons.disabled : ""}`}
          onClick={testPlexConnection}
        >
          Test
        </button>
      </AdminGridItem>
      <AdminGridItem title="Base Path">
        <p className={`${typo.body}`}>
          A base path can be applied to serve petio from a subdirectory. Any
          specified base must not include a trailing slash and will be applied
          to the end of the access URL. For example <code>/petio</code> would
          become <code>localhost:7777/petio</code>
        </p>
        <br />
        <p className={`${typo.small} ${typo.bold}`}>
          Warning! This will require a restart of Petio to take effect.
        </p>
        <br />
        {config && config.base_path ? (
          <input
            className={inputs.text__light}
            type="text"
            name="base_path"
            value={config.base_path}
            autoCorrect="off"
            spellCheck="off"
            onChange={handleChange}
          />
        ) : (
          <input className={inputs.text__light} type="text" readOnly />
        )}
        <br />
        <button
          className={`${buttons.primary} ${!config ? buttons.disabled : ""}`}
        >
          Save
        </button>
      </AdminGridItem>
      <AdminGridItem title="User Login">
        <p className={`${typo.body}`}>
          Logging into the admin panel in Petio will always require a
          Username/Email &amp; Password, however the standard user panel can be
          customised for <span className={typo.bold}>Fast Login</span> (where a
          user only needs to provide their Username / Email) or{" "}
          <span className={typo.bold}>Standard Login</span> (a user is required
          to enter a username and password)
        </p>
        <br />

        <div className={inputs.wrap}>
          <select
            className={inputs.select__light}
            name="login_type"
            value={config.login_type}
            onChange={handleChange}
          >
            <option value="1">Standard Login</option>
            <option value="2">Fast Login</option>
          </select>
        </div>

        <br />
        <button
          className={`${buttons.primary} ${!config ? buttons.disabled : ""}`}
        >
          Save
        </button>
      </AdminGridItem>
      <AdminGridItem title="Content Controls">
        <div className={inputs.checkboxes}>
          <div className={inputs.checkboxes__item}>
            <input
              type="checkbox"
              name="plexPopular"
              checked={config.plexPopular}
              onChange={handleChange}
            />
            <p className={`${typo.body}`}>
              Popular on Plex{" "}
              <span className={typo.bold}>(Requires Plex Pass)</span>
            </p>
          </div>
        </div>
        <br />
        <button
          className={`${buttons.primary} ${!config ? buttons.disabled : ""}`}
        >
          Save
        </button>
      </AdminGridItem>
    </div>
  );
}

export default connect(mapStateToProps)(SettingsGeneral);
