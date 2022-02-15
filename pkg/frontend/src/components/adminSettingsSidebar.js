import { Link } from "react-router-dom";
import styles from "../styles/views/adminSettings.module.scss";

export default function AdminSettingsSidebar() {
  return (
    <div className={styles.sidebar}>
      <Link
        to="/admin/settings"
        className={`${styles.sidebar__item} ${styles.sidebar__item__active}`}
      >
        General Settings
      </Link>
      <Link to="/admin/settings/radarr" className={styles.sidebar__item}>
        Radarr Settings
      </Link>
      <Link to="/admin/settings/sonarr" className={styles.sidebar__item}>
        Sonarr Settings
      </Link>
      <Link to="/admin/settings/filter" className={styles.sidebar__item}>
        Filter Settings
      </Link>
      <Link to="/admin/settings/notifications" className={styles.sidebar__item}>
        Notification Settings
      </Link>
      <Link
        to="/admin/settings/troubleshooting"
        className={styles.sidebar__item}
      >
        Troubleshooting
      </Link>
    </div>
  );
}
