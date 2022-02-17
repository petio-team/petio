import { Route, Switch, useHistory } from "react-router";
import AdminSettingsSidebar from "../../components/adminSettingsSidebar";
import NotFound from "../404";
import SettingsGeneral from "./settings-general";
import styles from "../../styles/views/adminSettings.module.scss";
import SettingsRadarr from "./settings-radarr";
import Meta from "../../components/meta";

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
              <SettingsRadarr newNotification={newNotification} />
            </Route>
            <Route path="*">
              <NotFound />
            </Route>
          </Switch>
        </div>
      </div>
    </div>
  );
}
