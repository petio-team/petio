import { Route, Switch, useHistory } from "react-router";
import AdminSettingsSidebar from "../../components/adminSettingsSidebar";
import SettingsGeneral from "./settings-general";
import styles from "../../styles/views/adminSettings.module.scss";
import SettingsArr from "./settings-arr";
import Meta from "../../components/meta";
import typo from "../../styles/components/typography.module.scss";
import SettingsFilter from "./settings-filter";

export default function Settings({ newNotification }) {
  const history = useHistory();
  return (
    <div className={styles.wrap}>
      <Meta title="Admin Settings" />
      <div className="container">
        <div className={styles.inner}>
          <AdminSettingsSidebar current={history.location.pathname} />

          <Switch>
            <Route exact path="/admin/settings">
              <SettingsGeneral newNotification={newNotification} />
            </Route>
            <Route exact path="/admin/settings/radarr">
              <SettingsArr type="radarr" newNotification={newNotification} />
            </Route>
            <Route exact path="/admin/settings/sonarr">
              <SettingsArr type="sonarr" newNotification={newNotification} />
            </Route>
            <Route exact path="/admin/settings/filter">
              <SettingsFilter />
            </Route>
            <Route path="*">
              <p className={`${typo.title} ${typo.bold}`}>Not found</p>
            </Route>
          </Switch>
        </div>
      </div>
    </div>
  );
}
