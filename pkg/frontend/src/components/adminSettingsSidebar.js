import { Link } from "react-router-dom";
import styles from "../styles/views/adminSettings.module.scss";

export default function AdminSettingsSidebar({ current }) {
  return (
    <div>
      <div className={styles.sidebar}>
        <Link
          to="/admin/settings"
          className={`${styles.sidebar__item} ${
            current === "/admin/settings" ? styles.sidebar__item__active : ""
          }`}
        >
          General Settings
        </Link>
        <Link
          to="/admin/settings/radarr"
          className={`${styles.sidebar__item} ${
            current === "/admin/settings/radarr"
              ? styles.sidebar__item__active
              : ""
          }`}
        >
          Radarr Settings
        </Link>
        <Link
          to="/admin/settings/sonarr"
          className={`${styles.sidebar__item} ${
            current === "/admin/settings/sonarr"
              ? styles.sidebar__item__active
              : ""
          }`}
        >
          Sonarr Settings
        </Link>
        <Link
          to="/admin/settings/filter"
          className={`${styles.sidebar__item} ${
            current === "/admin/settings/filter"
              ? styles.sidebar__item__active
              : ""
          }`}
        >
          Filter Settings
        </Link>
        <Link
          to="/admin/settings/notifications"
          className={`${styles.sidebar__item} ${
            current === "/admin/settings/notifications"
              ? styles.sidebar__item__active
              : ""
          }`}
        >
          Notification Settings
        </Link>
        <Link
          to="/admin/settings/troubleshooting"
          className={`${styles.sidebar__item} ${
            current === "/admin/troubleshooting"
              ? styles.sidebar__item__active
              : ""
          }`}
        >
          Troubleshooting
        </Link>
      </div>
    </div>
  );
}
