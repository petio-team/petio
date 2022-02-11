import styles from "../styles/components/install.module.scss";

export default function PwaAndroid({ callback, prompt }) {
  async function handleClick() {
    if (!prompt) {
      // The deferred prompt isn't available.
      return;
    }
    // Show the install prompt.
    prompt.prompt();
    // Log the result
    const result = await prompt.userChoice;
    console.log("👍", "userChoice", result);
    // Reset the deferred prompt variable, since
    // prompt() can only be called once.
    callback();
  }
  return (
    <div className={styles.wrap}>
      <div className={styles.inner}>
        <div className={styles.top}>
          <p>Install Petio</p>
        </div>
        <div className={styles.body}>
          <p>
            You can install this app on your phone's homescreen to easily access
            it anytime. No need to use the app store. Just click install below.
          </p>
          <br />
          <button onClick={handleClick} className={styles.button}>
            Install
          </button>
          <br />
          <br />
          <p>Prefer to keep using Petio in your browser?</p>
          <p onClick={callback}>
            <u>Dismiss this message</u>
          </p>
        </div>
      </div>
    </div>
  );
}
