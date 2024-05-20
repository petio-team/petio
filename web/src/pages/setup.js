// import Router from 'next/router';
import { useEffect, useState } from 'react';
import { connect } from 'react-redux';

import Meta from '../components/meta';
import SetupAuth from '../components/setup/setupAuth';
import SetupServer from '../components/setup/setupServer';
import SetupUser from '../components/setup/setupUser';
import { getHealth, saveConfig } from '../services/config.service';
import typo from '../styles/components/typography.module.scss';
import styles from '../styles/views/setup.module.scss';

const mapStateToProps = (state) => {
  return {
    redux_user: state.user,
  };
};

function Setup({ config, redux_user, newNotification }) {
  const [step, updateStep] = useState(0);
  const [setupUser, setSetupUser] = useState(null);
  const [setupServer, setSetupServer] = useState(false);

  useEffect(() => {
    if (step === 0 && redux_user.plexUser) updateStep(1);
    if (step === 1 && setupUser) updateStep(2);
  }, [redux_user, setupUser, step, setupServer]);

  async function submit() {
    let selectedServer = redux_user.plexServers[setupServer];
    let config = {
      user: setupUser.user,
      server: selectedServer,
    };
    const nId = newNotification({
      type: 'loading',
      message: 'Saving your config',
    });
    try {
      await saveConfig(config);
      newNotification({ type: 'success', message: 'Config saved', id: nId });
      updateStep(4);
      newNotification({
        type: 'loading',
        message: 'Installing Petio...',
      });
      setTimeout(() => {
        healthCheck();
      }, 10000); // for now just wait until api has time to build
    } catch (e) {
      newNotification({ type: 'error', message: e, id: nId });
    }
  }

  async function healthCheck() {
    try {
      await getHealth();
      window.location.reload();
    } catch {
      setTimeout(() => {
        healthCheck();
      }, 5000);
    }
  }

  let steps = [];
  for (let i = 0; i < 3; i++) {
    steps.push(
      <div
        className={`${styles.step} ${
          step > i
            ? styles.step__complete
            : step === i
            ? styles.step__active
            : ''
        }`}
        key={`setup_step_${i}`}
      >
        <p className={typo.body}>{i + 1}</p>
      </div>,
      <span key={`setup_divide_${i}`}></span>,
    );
  }
  let content = null;
  switch (step) {
    case 0:
      content = <SetupAuth />;
      break;
    case 1:
      content = (
        <SetupUser
          plexUser={redux_user.plexUser}
          setSetupUser={setSetupUser}
          newNotification={newNotification}
        />
      );
      break;
    case 2:
      content = (
        <SetupServer
          plexServers={redux_user.plexServers}
          setSetupServer={setSetupServer}
          newNotification={newNotification}
          submit={submit}
        />
      );
      break;
    case 3:
      content = <p className={typo.body}>loading, please wait...</p>;
      break;
    default:
      break;
  }

  return (
    <div className={styles.wrap}>
      <Meta title={'Setup'} />
      <div className={styles.steps}>{steps}</div>
      <div className={styles.content}>
        <p className={`${typo.title} ${typo.bold} mb-2`}>Setup</p>
        {content}
      </div>
    </div>
  );
}

export default connect(mapStateToProps)(Setup);
