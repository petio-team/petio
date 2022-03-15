import AdminGridItem from "../../components/adminGridItem";
import styles from "../../styles/views/adminSettings.module.scss";
import typo from "../../styles/components/typography.module.scss";
import buttons from "../../styles/components/button.module.scss";
import inputs from "../../styles/components/input.module.scss";
import { useState, useEffect } from "react";
import { connect } from "react-redux";
import {
  getConfig,
  getEmailConfig,
  updateConfig,
  testEmail,
  testDiscord,
  testTelegram,
  saveEmailConfig,
} from "../../services/config.service";

const mapStateToProps = (state) => {
  return {
    redux_config: state.user.config,
  };
};

function SettingsNotifications(props) {
  const [config, setConfig] = useState(props.redux_config);

  useEffect(() => {
    async function loadConfigs() {
      try {
        const config = await getConfig();
        const email = await getEmailConfig();
        setConfig({
          ...config,
          email_enabled: email.config.emailEnabled || false,
          email_user: email.config.emailUser,
          email_pass: email.config.emailPass,
          email_server: email.config.emailServer,
          email_port: email.config.emailPort,
          email_secure: email.config.emailSecure || false,
          email_from: email.config.emailFrom,
        });
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

  function inputChange(e) {
    const target = e.target;
    const name = target.name;
    let value = target.value;

    if (target.type === "checkbox") {
      value = target.checked;
    }

    let currentConfig = config;

    setConfig({ ...currentConfig, [name]: value });
  }

  async function emailTest() {
    try {
      await emailSave();
      let test = await testEmail();
      if (test.result) {
        props.newNotification({
          message: "Email Test Passed!",
          type: "success",
        });
      } else {
        props.newNotification({
          message: "Email Test Failed",
          type: "error",
        });
      }
    } catch (err) {
      console.log(err);
      props.newNotification({
        message: "Email Test Failed",
        type: "error",
      });
    }
  }

  async function discordTest() {
    try {
      await discordSave();
      let test = await testDiscord();
      if (test.result) {
        props.newNotification({
          message: "Discord Test Passed!",
          type: "success",
        });
      } else {
        props.newNotification({
          message: "Discord Test Failed",
          type: "error",
        });
      }
    } catch (err) {
      console.log(err);
      props.newNotification({
        message: "Discord Test Failed",
        type: "error",
      });
    }
  }

  async function telegramTest() {
    try {
      await telegramSave();
      let test = await testTelegram();
      if (test.result) {
        props.newNotification({
          message: "Telegram Test Passed!",
          type: "success",
        });
      } else {
        props.newNotification({
          message: "Telegram Test Failed",
          type: "error",
        });
      }
    } catch (err) {
      console.log(err);
      props.newNotification({
        message: "Telegram Test Failed",
        type: "error",
      });
    }
  }

  async function telegramSave() {
    try {
      await updateConfig({
        telegram_bot_token: config.telegram_bot_token,
        telegram_chat_id: config.telegram_chat_id,
        telegram_send_silently: config.telegram_send_silently,
      });
      props.newNotification({
        message: "Telegram Chat Config Saved",
        type: "success",
      });
    } catch (err) {
      console.log(err);
      props.newNotification({
        message: "Failed to Save Telegram Chat Config",
        type: "error",
      });
    }
  }

  async function discordSave() {
    try {
      await updateConfig({
        discord_webhook: config.discord_webhook,
      });
      props.newNotification({
        message: "Discord Webhook Saved",
        type: "success",
      });
    } catch (err) {
      console.log(err);
      props.newNotification({
        message: "Failed to Save Discord Webhook",
        type: "error",
      });
    }
  }

  async function emailSave() {
    try {
      await saveEmailConfig({
        user: config.email_user,
        pass: config.email_pass,
        server: config.email_server,
        port: config.email_port,
        secure: config.email_secure,
        enabled: config.email_enabled,
        from: config.email_from,
      });

      props.newNotification({
        message: "Email Settings Saved!",
        type: "success",
      });
    } catch (err) {
      console.log(err);
      props.newNotification({
        message: "Failed to Save Email Settings",
        type: "error",
      });
    }
  }

  if (!config) return null;

  return (
    <div className={styles.grid}>
      <AdminGridItem title="Email">
        <p className={`${typo.body}`}>From Address</p>
        <input
          type="text"
          name="email_from"
          value={config.email_from}
          onChange={inputChange}
          autoComplete="new-password"
          autoCorrect="off"
          spellCheck="off"
          className={inputs.text__light}
        />
        <br />
        <p className={`${typo.body}`}>Username</p>
        <input
          type="text"
          name="email_user"
          value={config.email_user}
          onChange={inputChange}
          autoComplete="new-password"
          autoCorrect="off"
          spellCheck="off"
          className={inputs.text__light}
        />
        <br />
        <p className={`${typo.body}`}>Password</p>
        <input
          type="password"
          name="email_pass"
          value={config.email_pass}
          onChange={inputChange}
          autoComplete="new-password"
          autoCorrect="off"
          spellCheck="off"
          className={inputs.text__light}
        />
        <br />
        <p className={`${typo.body}`}>SMTP Server</p>
        <input
          type="text"
          name="email_server"
          value={config.email_server}
          onChange={inputChange}
          autoComplete="new-password"
          autoCorrect="off"
          spellCheck="off"
          className={inputs.text__light}
        />
        <br />
        <p className={`${typo.body}`}>Port</p>
        <input
          type="number"
          name="email_port"
          value={config.email_port}
          onChange={inputChange}
          autoComplete="new-password"
          autoCorrect="off"
          spellCheck="off"
          className={inputs.text__light}
        />
        <br />
        <div className={inputs.checkboxes}>
          <div className={inputs.checkboxes__item}>
            <input
              type="checkbox"
              name="email_secure"
              checked={config.email_secure}
              onChange={inputChange}
            />
            <p className={`${typo.body}`}>
              Use Secure{" "}
              <span className={typo.bold}>(For port 587 or 25 use false)</span>
            </p>
          </div>
        </div>
        <br />
        <div className={inputs.checkboxes}>
          <div className={inputs.checkboxes__item}>
            <input
              type="checkbox"
              name="email_enabled"
              checked={config.email_enabled}
              onChange={inputChange}
            />
            <p className={`${typo.body}`}>Enabled</p>
          </div>
        </div>
        <br />
        <p className={`${typo.body}`}>
          Using Gmail? You can either create a{" "}
          <a
            target="_blank"
            rel="noreferrer"
            href="https://support.google.com/accounts/answer/185833"
            className={typo.link}
          >
            One Time App Password
          </a>{" "}
          or you can choose to allow
          <a
            target="_blank"
            rel="noreferrer"
            href="https://www.google.com/settings/security/lesssecureapps"
            className={typo.link}
          >
            {" "}
            Less Secure Apps
          </a>{" "}
          to allow Petio to send emails on your behalf.
        </p>
        <br />
        <button
          className={`${buttons.primary} ${!config ? buttons.disabled : ""}`}
          onClick={emailSave}
        >
          Save
        </button>
        <br />
        <button
          className={`${buttons.secondary} ${!config ? buttons.disabled : ""}`}
          onClick={emailTest}
        >
          Test
        </button>
      </AdminGridItem>
      <AdminGridItem title="Telegram">
        <p className={`${typo.body}`}>
          Please enter here your Telegram chat config. You can find
          documentation about Telegram&apos;s bot on{" "}
          <a
            href="https://core.telegram.org/bots"
            target="_blank"
            rel="noreferrer"
            className={typo.link}
          >
            Telegram documentation
          </a>
          .
        </p>
        <br />
        <p className={`${typo.body}`}>Bot token</p>
        <input
          type="text"
          name="telegram_bot_token"
          value={config.telegram_bot_token}
          onChange={inputChange}
          autoCorrect="off"
          spellCheck="off"
          className={inputs.text__light}
        />
        <br />
        <p className={`${typo.body}`}>Chat ID</p>
        <input
          type="text"
          name="telegram_chat_id"
          value={config.telegram_chat_id}
          onChange={inputChange}
          autoCorrect="off"
          spellCheck="off"
          className={inputs.text__light}
        />
        <br />
        <p className={`${typo.body}`}>
          You must start a conversation with the bot or add it to your group to
          receive messages.
          <br />
          <a
            target="_blank"
            href="http://stackoverflow.com/a/37396871/882971"
            rel="noreferrer"
            className={typo.link}
          >
            More Info
          </a>
        </p>
        <br />
        <div className={inputs.checkboxes}>
          <div className={inputs.checkboxes__item}>
            <input
              type="checkbox"
              name="telegram_send_silently"
              checked={config.telegram_send_silently}
              onChange={inputChange}
            />
            <p className={typo.body}>
              Send silently (notification with no sound)
            </p>
          </div>
        </div>
        <br />
        <button
          className={`${buttons.primary} ${!config ? buttons.disabled : ""}`}
          onClick={telegramSave}
        >
          Save
        </button>
        <br />
        <button
          className={`${buttons.secondary} ${!config ? buttons.disabled : ""}`}
          onClick={telegramTest}
        >
          Test
        </button>
      </AdminGridItem>
      <AdminGridItem title="Discord">
        <p className={`${typo.body}`}>Please paste here your Discord webhook</p>
        <input
          type="text"
          name="discord_webhook"
          value={config.discord_webhook}
          onChange={inputChange}
          autoCorrect="off"
          spellCheck="off"
          className={inputs.text__light}
        />
        <br />
        <button
          className={`${buttons.primary} ${!config ? buttons.disabled : ""}`}
          onClick={discordSave}
        >
          Save
        </button>
        <br />
        <button
          className={`${buttons.secondary} ${!config ? buttons.disabled : ""}`}
          onClick={discordTest}
        >
          Test
        </button>
      </AdminGridItem>
    </div>
  );
}

export default connect(mapStateToProps)(SettingsNotifications);
