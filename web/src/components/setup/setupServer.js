import { useState } from 'react';

import { ReactComponent as Good } from '../../assets/svg/check.svg';
import { ReactComponent as Bad } from '../../assets/svg/close.svg';
import { ReactComponent as Docker } from '../../assets/svg/docker.svg';
import { ReactComponent as Linux } from '../../assets/svg/linux.svg';
import { ReactComponent as LockIcon } from '../../assets/svg/lock.svg';
import { ReactComponent as OSX } from '../../assets/svg/mac.svg';
import { ReactComponent as Server } from '../../assets/svg/server.svg';
import { ReactComponent as Spinner } from '../../assets/svg/spinner.svg';
import { ReactComponent as UnlockIcon } from '../../assets/svg/unlock.svg';
import { ReactComponent as Windows } from '../../assets/svg/windows.svg';
import button from '../../styles/components/button.module.scss';
import typo from '../../styles/components/typography.module.scss';
import styles from '../../styles/views/setup.module.scss';

export default function SetupServer(props) {
  const [picked, setPicked] = useState(false);

  function serverIcon(platform) {
    switch (platform) {
      case 'Linux':
        return <Linux />;

      case 'Windows':
        return <Windows />;

      case 'MacOSX':
        return <OSX />;

      case 'docker':
        return <Docker />;

      default:
        return <Server />;
    }
  }

  function selectServer(id) {
    setPicked(id);
    props.setSetupServer(id);
  }

  function saveServer() {
    if (!picked)
      props.newNotification({
        type: 'error',
        message: 'No server selected please pick a server from the list',
      });
    if (picked) {
      props.submit();
    }
  }

  return (
    <div className="step-3">
      <p className={`${typo.body}`}>Please select your server</p>
      <p className={`${typo.body} mb-2`}>
        Note: Plex Direct urls sometimes change or break so we don&apos;t advise
        using them.
      </p>
      <div className={styles.servers}>
        {Object.keys(props.plexServers).length === 0 ? (
          <p className={typo.body}>
            You don&apos;t own any servers. Only the server owner can setup a
            Petio instance.
          </p>
        ) : (
          Object.keys(props.plexServers).map((key) => {
            let server = props.plexServers[key];
            return (
              <div
                key={key}
                className={`${styles.server_option} ${
                  picked === key ? styles.server_option__selected : ''
                } ${
                  server.status !== 'connected'
                    ? styles.server_option__disabled
                    : ''
                } mb-1`}
                data-id={key}
                onClick={(e) => selectServer(e.target.dataset.id)}
              >
                <div className={styles.server_option__icon}>
                  {serverIcon(server.platform)}
                </div>
                <div className={styles.server_option__name}>
                  <p
                    className={`${typo.body} ${typo.medium} ${styles.server_option__name__top}`}
                  >
                    {server.name}
                    <span
                      className={`${styles.server_option__lock} ${
                        server.protocol === 'https'
                          ? styles.server_option__lock__secure
                          : styles.server_option__lock__insecure
                      }`}
                    >
                      {server.protocol === 'https' ? (
                        <LockIcon />
                      ) : (
                        <UnlockIcon />
                      )}
                    </span>
                  </p>
                  <p className={typo.small}>{`${server.protocol}://${
                    server.host
                  }${server.port ? ':' : ''}${server.port}`}</p>
                </div>
                <div className={styles.server_option__status}>
                  <div
                    className={`${styles.server_option__status__item} ${
                      styles.server_option__status__item__pending
                    } ${
                      server.status === 'pending'
                        ? styles.server_option__status__active
                        : ''
                    }`}
                  >
                    <Spinner />
                  </div>
                  <div
                    className={`${styles.server_option__status__item} ${
                      styles.server_option__status__item__good
                    } ${
                      server.status === 'connected'
                        ? styles.server_option__status__active
                        : ''
                    }`}
                  >
                    <span>
                      <Good />
                    </span>
                  </div>
                  <div
                    className={`${styles.server_option__status__item} ${
                      styles.server_option__status__item__bad
                    } ${
                      server.status === 'failed'
                        ? styles.server_option__status__active
                        : ''
                    }`}
                  >
                    <span>
                      <Bad />
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <button
          className={`${button.primary} ${button.auto} mt-2 ${
            picked ? '' : button.disabled
          }`}
          onClick={saveServer}
        >
          Finish
        </button>
      </div>
    </div>
  );
}
