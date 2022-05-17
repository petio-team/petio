import typo from "../../styles/components/typography.module.scss";
import button from "../../styles/components/button.module.scss";
import inp from "../../styles/components/input.module.scss";
import { useState } from "react";

export default function SetupUser(props) {
  const [password, setPassword] = useState("");

  function saveUser() {
    if (password.length < 8) {
      props.newNotification({
        type: "error",
        message:
          "Your password is too short, please enter a password with 8 characters or more.",
      });
      return;
    } else {
      props.setSetupUser({
        user: {
          username: props.plexUser.username,
          id: props.plexUser.id,
          email: props.plexUser.email,
          password: password,
          token: props.plexUser.token,
          thumb: props.plexUser.thumbnail,
        },
      });
    }
  }

  return (
    <div className="step-2">
      <p className={`${typo.body} mb-2`}>
        This is your Petio admin user details, we will use your Plex Username /
        Email, but a custom password just for Petio can be used.
      </p>
      <p className={`${typo.body} mb-1`}>Petio Admin Username</p>
      <input
        type="text"
        name="username"
        value={props.plexUser.username}
        readOnly={true}
        className={`${inp.text} mb-2`}
      ></input>

      <p className={`${typo.body} mb-1`}>Petio Admin Email</p>
      <input
        type="email"
        name="email"
        value={props.plexUser.email}
        readOnly={true}
        className={`${inp.text} mb-2`}
      ></input>
      <p className={`${typo.body} mb-1`}>Petio Admin Password</p>
      <input
        type="password"
        name="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className={`${inp.text} mb-2`}
      ></input>
      <button
        className={`${button.primary} ${button.auto} ${
          password.length > 7 ? "" : button.disabled
        }`}
        onClick={saveUser}
      >
        Next
      </button>
    </div>
  );
}
