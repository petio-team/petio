import { connect } from "react-redux";
import { Login } from "../../components/login";
import styles from "../../styles/views/admin.module.scss";
import typo from "../../styles/components/typography.module.scss";
import { Route, Switch } from "react-router";
import AdminDashboard from "./dashboard";
import { Link } from "react-router-dom";
import NotFound from "../404";

const mapStateToProps = (state) => {
  return {
    redux_user: state.user,
  };
};

function Admin({
  redux_user,
  newNotification,
  config,
  setCurrentUser,
  setIsLoggedIn,
}) {
  function setLoadingScreen() {
    return;
  }

  if (redux_user.isAdminLogin)
    return (
      <div className={styles.wrap}>
        <div className="container">
          <p className={`${typo.title} ${typo.bold}`}>Admin Area</p>
          <div className={styles.menu}>
            <div className={styles.menu__item}>
              <p className={`${typo.body} ${typo.uppercase} ${typo.medium}`}>
                <Link to="/admin">Dashboard</Link>
              </p>
            </div>
            <div className={styles.menu__item}>
              <p className={`${typo.body} ${typo.uppercase} ${typo.medium}`}>
                <Link to="/admin/requests">Requests</Link>
              </p>
            </div>
          </div>
        </div>
        <div className={styles.viewport}>
          <Switch>
            <Route exact path="/admin">
              <AdminDashboard />
            </Route>
            <Route exact path="/admin/requests">
              <div className="container">
                <p>Requests</p>
              </div>
            </Route>
            <Route path="*">
              <NotFound />
            </Route>
          </Switch>
        </div>
      </div>
    );

  return (
    <Login
      config={{ login_type: 1 }}
      setIsLoggedIn={setIsLoggedIn}
      setCurrentUser={setCurrentUser} // fix this to redux globally <----
      setLoadingScreen={setLoadingScreen}
      newNotification={newNotification}
    />
  );
}

export default connect(mapStateToProps)(Admin);
