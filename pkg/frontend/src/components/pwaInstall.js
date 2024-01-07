import { ReactComponent as IosIcon } from '../assets/svg/iosShare.svg';
import styles from '../styles/components/install.module.scss';

export default function PwaInstall({ callback }) {
  return (
    <div className={styles.wrap}>
      <div className={styles.inner}>
        <div className={styles.top}>
          <p>Install Petio</p>
        </div>
        <div className={styles.body}>
          <p>
            You can install this app on your phone's homescreen to easily access
            it anytime. No need to use the app store. Just follow the steps
            below.
          </p>
          <p>
            <b>Note: You must be using Safari to follow these steps</b>
          </p>
          <ul>
            <li>
              <p>
                Step 1: Tap the{' '}
                <span>
                  <IosIcon viewBox="0 0 50 50" />
                </span>{' '}
                icon below
              </p>
            </li>
            <li>
              <p>Step 2: Scroll down until you see "add to home screen"</p>
            </li>
            <li>
              <p>
                Step 3: Select done, you will now find Petio installed on your
                home screen
              </p>
            </li>
          </ul>
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
