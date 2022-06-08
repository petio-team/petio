import dateFormat from 'dateformat';

import styles from '../styles/components/notifications.module.scss';
import type from '../styles/components/typography.module.scss';

export default function Notification({ msg }) {
  if (!msg) return null;

  return (
    <div className={`${styles.notification}`}>
      <p className={`${type.xsmall} ${type.uppercase}`}>
        {dateFormat(new Date(msg.timestamp), 'mmm d yyyy HH:MM:ss')}
      </p>
      <p className={type.body}>{msg.message}</p>
    </div>
  );
}
