import { Route, Switch } from "react-router";
import AdminSettingsSidebar from "../../components/adminSettingsSidebar";
import NotFound from "../404";
import SettingsGeneral from "./settings-general";
import styles from "../../styles/views/adminSettings.module.scss";

export default function Settings() {
  return (
    <div className={styles.wrap}>
      <div className="container">
        <div className={styles.inner}>
          <AdminSettingsSidebar />
          <Switch>
            <Route exact path="/admin/settings">
              <SettingsGeneral />
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
