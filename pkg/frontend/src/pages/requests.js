import { useEffect } from 'react';
import { connect } from 'react-redux';

import { Loading } from '../components/loading';
import Meta from '../components/meta';
import Request from '../components/request';
import media from '../services/media.service';
import { myRequests, myRequestsArchive } from '../services/user.service';
import typo from '../styles/components/typography.module.scss';
import styles from '../styles/views/requests.module.scss';

const mapStateToProps = (state) => {
  return {
    requests: state.user.myRequests,
    currentUser: state.user.currentUser,
  };
};

function Requests({ requests, currentUser }) {
  useEffect(() => {
    if (!currentUser.id) return;
    myRequests();
    myRequestsArchive(currentUser.id);
  }, [currentUser]);

  useEffect(() => {
    if (!requests) return;
    let tv = [];
    let movie = [];
    requests.forEach((request) => {
      if (request.type === 'movie') movie.push(request.tmdb_id);
      if (request.type === 'tv') tv.push(request.tmdb_id);
    });
    media.batchLookup(tv, 'tv', false);
    media.batchLookup(movie, 'movie', false);
  }, [requests]);

  return (
    <div className={styles.wrap}>
      <Meta title={`Your Requests`} />
      {requests === null ? <Loading /> : null}
      <div className="container">
        <p className={`${styles.title} ${typo.xltitle} ${typo.bold}`}>
          Your Requests
        </p>
        <p className={`${typo.bold} ${typo.uppercase} ${typo.body}`}>
          Active Requests
        </p>
        <div className={styles.grid}>
          {requests && requests.length > 0 && currentUser ? (
            requests.map((request) => {
              if (request.users.includes(currentUser.id.toString()))
                return (
                  <Request request={request} key={`request_${request._id}`} />
                );
              return null;
            })
          ) : (
            <p
              className={`${styles.grid__noresults} ${typo.body} ${typo.bold}`}
            >
              You don't have any active requests
            </p>
          )}
        </div>
        <p className={`${typo.bold} ${typo.uppercase} ${typo.body}`}>
          Archive Requests
        </p>
        <div className={styles.archive}>archive</div>
      </div>
    </div>
  );
}

export default connect(mapStateToProps)(Requests);
