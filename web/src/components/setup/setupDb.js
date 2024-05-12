import { useState } from 'react';

import { ReactComponent as Good } from '../../assets/svg/check.svg';
import { ReactComponent as Bad } from '../../assets/svg/close.svg';
import { ReactComponent as Server } from '../../assets/svg/server.svg';
import { ReactComponent as Spinner } from '../../assets/svg/spinner.svg';
import { testMongo } from '../../services/config.service';
import button from '../../styles/components/button.module.scss';
import inp from '../../styles/components/input.module.scss';
import typo from '../../styles/components/typography.module.scss';
import styles from '../../styles/views/setup.module.scss';

export default function SetupDb(props) {
  const [mongoType, setMongoType] = useState('mongodb://');
  const [mongoInstall, setMongoInstall] = useState('docker');
  const [db, setDb] = useState('mongo:27017');
  const [mongoStatus, setMongoStatus] = useState('');

  function changeMongoType() {
    setMongoType(
      mongoType === 'mongodb+srv://' ? 'mongodb://' : 'mongodb+srv://',
    );
    setMongoStatus('');
  }

  function mongoPreset(type) {
    let preset;
    switch (type) {
      case 'docker':
        preset = 'mongo:27017';
        break;
      case 'unraid':
        preset = 'X.X.X.X:27017';
        break;
      default:
        preset = 'localhost:27017';
    }
    setMongoInstall(type);
    setDb(preset);
  }

  async function test() {
    setMongoStatus('pending');
    const nId = props.newNotification({
      type: 'loading',
      message: 'Testing database connection',
    });
    let dbString = mongoType + db;
    let test = await testMongo(dbString);
    if (test === 'failed') {
      props.newNotification({
        type: 'error',
        message: 'Database connection test failed',
        id: nId,
      });
      props.setSetupDb('');
    } else {
      props.newNotification({
        type: 'success',
        message: 'Database connection test passed',
        id: nId,
      });
      props.setSetupDb(dbString);
    }
    setMongoStatus(test);
  }

  return (
    <div className="step-4">
      <p className={`${typo.body} mb-1`}>
        Mongo Database path, if using docker leave as default, otherwise specify
        your db path.
      </p>
      <p className={`${typo.small} mb-2`}>
        To switch between local / cloud db clusters click on the prefix to
        switch between the two.
      </p>
      <div className={styles.db_tabs}>
        <div
          className={`${styles.db_tabs__item} ${
            mongoInstall === 'docker' ? styles.db_tabs__item__active : ''
          }`}
          onClick={() => mongoPreset('docker')}
        >
          <p className={`${typo.small} ${typo.uppercase} ${typo.medium}`}>
            Docker
          </p>
        </div>
        <div
          className={`${styles.db_tabs__item} ${
            mongoInstall === 'unraid' ? styles.db_tabs__item__active : ''
          }`}
          onClick={() => mongoPreset('unraid')}
        >
          <p className={`${typo.small} ${typo.uppercase} ${typo.medium}`}>
            Unraid
          </p>
        </div>
        <div
          className={`${styles.db_tabs__item} ${
            mongoInstall === 'other' ? styles.db_tabs__item__active : ''
          }`}
          onClick={() => mongoPreset('other')}
        >
          <p className={`${typo.small} ${typo.uppercase} ${typo.medium}`}>
            Other
          </p>
        </div>
      </div>
      <div className={styles.db_content}>
        <div className={styles.db_content__icon}>
          <Server />
        </div>
        <div className={inp.prefix__wrap}>
          <div className={inp.prefix} onClick={changeMongoType}>
            {mongoType}
          </div>
          <input
            style={
              mongoStatus === 'pending'
                ? { pointerEvents: 'none' }
                : { pointerEvents: 'all' }
            }
            type="text"
            name="db"
            value={db}
            onChange={(e) => setDb(e.target.value)}
            className={inp.text}
          />
        </div>
        <div className={styles.db_content__status}>
          <div
            className={`${styles.db_content__status__item} ${
              styles.db_content__status__item__pending
            } ${
              mongoStatus === 'pending'
                ? styles.db_content__status__item__active
                : ''
            }`}
          >
            <Spinner />
          </div>
          <div
            className={`${styles.db_content__status__item} ${
              styles.db_content__status__item__good
            } ${
              mongoStatus === 'connected'
                ? styles.db_content__status__item__active
                : ''
            }`}
          >
            <Good />
          </div>
          <div
            className={`${styles.db_content__status__item} ${
              styles.db_content__status__item__bad
            } ${
              mongoStatus === 'failed'
                ? styles.db_content__status__item__active
                : ''
            }`}
          >
            <Bad />
          </div>
        </div>
      </div>
      <div className={button.wrap}>
        <button
          className={`${button.secondary} ${button.auto} mt-2 ${
            mongoStatus !== 'pending' ? '' : button.disabled
          }`}
          onClick={test}
          style={{ marginRight: '10px' }}
        >
          Test
        </button>
        <button
          className={`${button.primary} ${button.auto} mt-2 ${
            mongoStatus === 'connected' ? '' : button.disabled
          }`}
          onClick={props.submit}
        >
          Finish
        </button>
      </div>
    </div>
  );
}
