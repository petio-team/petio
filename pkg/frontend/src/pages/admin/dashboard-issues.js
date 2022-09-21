import { useEffect } from 'react';
import { connect } from 'react-redux';

import { getIssues } from '../../services/user.service';
import typo from '../../styles/components/typography.module.scss';
import styles from '../../styles/views/admin.module.scss';

const mapStateToProps = (state) => {
  return {
    requests: state.user.requests,
    redux_movies: state.media.movies,
    redux_tv: state.media.tv,
    redux_issues: state.user.issues,
  };
};

function Issues({ redux_issues }) {
  useEffect(() => {
    getIssues();
  });

  if (redux_issues.length === 0)
    return (
      <div className={styles.dashboard__module}>
        <p className={typo.body}>No issues reported</p>
      </div>
    );

  return (
    <div className={styles.dashboard__module}>
      {redux_issues.map((issue) => {
        return (
          <div className={styles.dashboard__issue}>
            <p className={typo.body}>
              <b>{issue.title}:</b> {formatIssue(issue.issue)}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function formatIssue(issue) {
  switch (issue) {
    case 'season':
      return 'Missing Season';
    case 'subs':
      return 'Missing Subtitles';
    case 'bad-video':
      return 'Bad Quality / Video Issue';
    case 'bad-audio':
      return 'Audio Issue / Audio Sync';
    case 'other':
      return 'Other';
    default:
      return '';
  }
}

export default connect(mapStateToProps)(Issues);
