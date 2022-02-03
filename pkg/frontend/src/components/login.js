// Styles
import styles from "../styles/components/login.module.scss";
import buttons from "../styles/components/button.module.scss";
import inputs from "../styles/components/input.module.scss";
import typo from "../styles/components/typography.module.scss";

// Components
import Meta from "../components/meta";
import { ReactComponent as Logo } from "../assets/svg/logo.svg";
import { useState } from "react";
import { useHistory } from "react-router-dom";

// Services
import { login, clearToken } from "../services/user.service";
import { plexAuthLogin } from "../services/plex.service";
import oAuthWindow from "./oAuthWindow";

export function Login(props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const logintype = props.config ? props.config.login_type : 0;

  const history = useHistory();

  async function submitLogin() {
    try {
      props.setLoadingScreen(true);
      const req = await login({
        username,
        password,
        logintype,
      });
      props.setCurrentUser(req.user);
      props.setIsLoggedIn(true);
      props.setLoadingScreen(false);
    } catch (e) {
      clearToken();
      console.log(e);
      props.setLoadingScreen(false);
      props.newNotification({ message: "Login Failed", type: "error" });
    }
  }

  async function loginOauth() {
    try {
      let plexWindow = oAuthWindow("", "Login with Plex", 500, 500);
      let res = await plexAuthLogin(plexWindow);
      if (res.error) {
        props.newNotification({ type: "error", message: res.error });
        return;
      }
      props.setCurrentUser(res.user);
      props.setIsLoggedIn(true);
    } catch (err) {
      console.log(err);
      props.newNotification({ message: "Login Failed", type: "error" });
    }
  }

  return (
    <div className={styles.wrap}>
      <Meta title={"Login"} />
      <div className={styles.inner}>
        <div className={styles.logo}>
          <Logo viewBox="0 0 98 24" />
        </div>
        <hr className="spaced" />
        <h1 className={typo.title + " mb-2"}>Login</h1>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submitLogin();
          }}
        >
          <input
            type="text"
            className={inputs.text + " mb-2"}
            placeholder={"Username / Email"}
            onChange={(e) => setUsername(e.target.value)}
          />
        </form>
        {logintype === 1 || history.location.pathname === "/admin" ? (
          <>
            <input
              type="password"
              className={inputs.text + " mb-2"}
              placeholder={"Password"}
              onChange={(e) => setPassword(e.target.value)}
            />
          </>
        ) : null}
        <button className={buttons.primary} onClick={() => submitLogin()}>
          Login
        </button>
        <p className={styles.divide}>or</p>
        <button className={buttons.primary} onClick={loginOauth}>
          Login with Plex
        </button>
      </div>
    </div>
  );
}
