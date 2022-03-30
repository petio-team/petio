import styles from "../styles/views/myAccount.module.scss";
import typo from "../styles/components/typography.module.scss";
import { connect } from "react-redux";
import { getUserQuota, logout, watchHistory } from "../services/user.service";
import Meta from "../components/meta";
import { useEffect, useState } from "react";
import ReviewQueue from "../components/reviewQueue";

const mapStateToProps = (state) => {
  return {
    redux_user: state.user,
  };
};

function MyAccount({ redux_user }) {
  const [quota, setQuota] = useState(false);
  const [history, setHistory] = useState(false);

  useEffect(() => {
    async function getQuota() {
      try {
        let q = await getUserQuota();
        setQuota(q);
      } catch (err) {
        setQuota({
          current: "error",
          total: "error",
        });
      }
    }
    async function getHistory() {
      if (redux_user.currentUser.custom && !redux_user.currentUser.altId) {
        setHistory({});
        return;
      }
      try {
        const userId = redux_user.currentUser.altId
          ? redux_user.currentUser.altId
          : redux_user.currentUser.id;
        let h = await watchHistory(userId, "all");
        setHistory(h);
      } catch (err) {
        setHistory("error");
      }
    }

    getQuota();
    getHistory();
    // eslint-disable-next-line
  }, []);

  function formatQuota() {
    if (!quota) {
      return "Loading...";
    }
    if (quota.current === "error") {
      return "Error";
    } else {
      let current = quota.current;
      let total = quota.total > 0 ? quota.total : "∞";
      return `${current} / ${total} - per week`;
    }
  }

  console.log(history);

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
        <hr className={styles.divide} />
        <p className={`${typo.smtitle} ${typo.bold} ${styles.block__title}`}>
          Account Details
        </p>
        <p className={typo.body}>
          <b>Role:</b>{" "}
          <span style={{ textTransform: "capitalize" }}>
            {redux_user.currentUser.role}
          </span>
        </p>
        <p className={typo.body}>
          <b>Email:</b> {redux_user.currentUser.email}
        </p>
        <p className={typo.body}>
          <b>Username:</b> {redux_user.currentUser.username}
        </p>
        <p className={typo.body}>
          <b>Quota:</b> {formatQuota()}
        </p>
        <hr className={styles.divide} />
        <p className={`${typo.smtitle} ${typo.bold} ${styles.block__title}`}>
          Your Review Queue
        </p>
        <ReviewQueue history={history} />
      </div>
    </div>
  );
}

export default connect(mapStateToProps)(MyAccount);
