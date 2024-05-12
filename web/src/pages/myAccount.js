import { useEffect, useState } from 'react';
import { connect } from 'react-redux';

import Meta from '../components/meta';
import MyIssues from '../components/myIssues';
import ReviewQueue from '../components/reviewQueue';
import {
  getIssues,
  getUserQuota,
  logout,
  watchHistory,
} from '../services/user.service';
import typo from '../styles/components/typography.module.scss';
import styles from '../styles/views/myAccount.module.scss';

const mapStateToProps = (state) => {
  return {
    redux_user: state.user,
    redux_reviews: state.user.reviews,
    redux_history: state.user.history,
    redux_issues: state.user.issues,
  };
};

function MyAccount({
  redux_user,
  redux_reviews,
  redux_history,
  redux_issues,
  newNotification,
}) {
  const [quota, setQuota] = useState(false);

  useEffect(() => {
    async function getQuota() {
      try {
        let q = await getUserQuota();
        setQuota(q);
      } catch (err) {
        setQuota({
          current: 'error',
          total: 'error',
        });
      }
    }
    async function getHistory() {
      if (redux_user.currentUser.custom && !redux_user.currentUser.altId) {
        return;
      }
      try {
        const userId = redux_user.currentUser.altId
          ? redux_user.currentUser.altId
          : redux_user.currentUser.id;
        watchHistory(userId, 'all');
      } catch (err) {
        console.log('Error getting watch history');
      }
    }

    getQuota();
    getHistory();
    getIssues();
    // eslint-disable-next-line
  }, []);

  function formatQuota() {
    if (!quota) {
      return 'Loading...';
    }
    if (quota.current === 'error') {
      return 'Error';
    } else {
      let current = quota.current;
      let total = quota.total > 0 ? quota.total : '∞';
      return `${current} / ${total} - per week`;
    }
  }

  return (
    <div className={styles.wrap}>
      <Meta title={`My Account`} />
      <div className="container">
        <p className={`${typo.title} ${typo.bold}`}>My Account</p>
        <p className={`${typo.smtitle} ${typo.bold} ${styles.username}`}>
          Welcome back{' '}
          {redux_user && redux_user.currentUser
            ? redux_user.currentUser.username || redux_user.currentUser.email
            : ''}{' '}
          <span className={`${typo.small} ${styles.signOut}`} onClick={logout}>
            (Sign out?)
          </span>
        </p>
        <hr className={styles.divide} />
        <div className={styles.accountItems}>
          <div className={styles.accountItem}>
            <p
              className={`${typo.smtitle} ${typo.bold} ${styles.block__title}`}
            >
              Account Details
            </p>
            <p className={typo.body}>
              <b>Role:</b>{' '}
              <span style={{ textTransform: 'capitalize' }}>
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
          </div>
          <div className={styles.accountItem}>
            <p
              className={`${typo.smtitle} ${typo.bold} ${styles.block__title}`}
            >
              Your Issues
            </p>
            <MyIssues
              issues={redux_issues}
              userId={redux_user.currentUser.id}
            />
          </div>
          <div className={styles.accountItem}>
            <p
              className={`${typo.smtitle} ${typo.bold} ${styles.block__title}`}
            >
              Your Preferences
            </p>
            <p className={typo.body}>
              <b>Email Notifications:</b> Yes
            </p>
            <p className={typo.body}>
              <b>Discord Notifications:</b> Yes
            </p>
            <p className={typo.body}>
              <b>Child Account:</b> No
            </p>
            <p className={typo.body}>
              <b>Default Language:</b> English
            </p>
            <button className={`${typo.small} ${styles.prefBtn}`}>
              Edit Preferences
            </button>
          </div>
        </div>
        <hr className={styles.divide} />
        <p className={`${typo.smtitle} ${typo.bold} ${styles.block__title}`}>
          Your Review Queue
        </p>
        <ReviewQueue
          history={redux_history}
          redux_reviews={redux_reviews}
          currentUser={redux_user.currentUser}
          newNotification={newNotification}
        />
      </div>
    </div>
  );
}

export default connect(mapStateToProps)(MyAccount);
