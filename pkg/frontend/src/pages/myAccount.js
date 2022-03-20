import styles from "../styles/views/myAccount.module.scss";
import typo from "../styles/components/typography.module.scss";
import { connect } from "react-redux";
import { logout } from "../services/user.service";
import Meta from "../components/meta";

const mapStateToProps = (state) => {
  return {
    redux_user: state.user,
  };
};

function MyAccount({ redux_user }) {
  return (
    <div className={styles.wrap}>
      <Meta title={`My Account`} />
      <div className="container">
        <p className={`${typo.title} ${typo.bold}`}>My Account</p>
        <p className={`${typo.smtitle} ${typo.bold} ${styles.username}`}>
          Welcome back{" "}
          {redux_user && redux_user.currentUser
            ? redux_user.currentUser.username || redux_user.currentUser.email
            : ""}{" "}
          <span className={`${typo.small} ${styles.signOut}`} onClick={logout}>
            (Sign out?)
          </span>
        </p>
      </div>
    </div>
  );
}

export default connect(mapStateToProps)(MyAccount);
