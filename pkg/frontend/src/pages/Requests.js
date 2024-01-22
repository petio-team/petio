import { useEffect } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import { Loading } from '../components/loading';
import Meta from '../components/meta';
import Request from '../components/request';
import media from '../services/media.service';
import { myRequests, myRequestsArchive } from '../services/user.service';
import tableStyle from '../styles/components/table.module.scss';
import typo from '../styles/components/typography.module.scss';
import styles from '../styles/views/requests.module.scss';

const mapStateToProps = (state) => {
  return {
    requests: state.user.myRequests,
    requestsArchive: state.user.myRequestsArchive,
    currentUser: state.user.currentUser,
  };
};

function Requests({ requests, requestsArchive, currentUser }) {
  useEffect(() => {
    if (!currentUser.id) return;
    myRequests();
    myRequestsArchive(currentUser.id);
  }, [currentUser]);

  useEffect(() => {
    if (!requests || Object.keys(requests).length === 0) return;
    let tv = [];
    let movie = [];
    Object.keys(requests).forEach((key) => {
      const request = requests[key];
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
          {requests && Object.keys(requests).length > 0 ? (
            Object.keys(requests).map((key) => {
              const request = requests[key];
              return (
                <Request
                  request={request}
                  key={`request_${request.media.id}`}
                />
              );
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
        <div className={styles.archive}>
          <table className={`${tableStyle.rounded} ${styles.table2}`}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Approved</th>
                <th>Removed</th>
                <th>Complete</th>
                <th>Reason for Removal</th>
                <th>Date Added</th>
              </tr>
            </thead>
            <tbody>
              {requestsArchive && requestsArchive.length > 0 ? (
                requestsArchive.map((request) => {
                  return (
                    <tr key={request._id}>
                      <td>
                        <Link to={`/${request.type}/${request.requestId}`}>
                          {request.title}
                        </Link>
                      </td>
                      <td style={{ textTransform: 'capitalize' }}>
                        {request.type}
                      </td>
                      <td>{request.approved ? 'Yes' : 'No'}</td>
                      <td>{request.removed ? 'Yes' : 'No'}</td>
                      <td>{request.complete ? 'Yes' : 'No'}</td>
                      <td>
                        {request.removed_reason !== 'false'
                          ? request.removed_reason
                          : 'None'}
                      </td>
                      <td>
                        {request.timeStamp
                          ? `${new Date(
                              request.timeStamp,
                            ).getFullYear()}/${new Date(
                              request.timeStamp,
                            ).getMonth()}/${new Date(
                              request.timeStamp,
                            ).getDate()} ${new Date(
                              request.timeStamp,
                            ).getHours()}:${new Date(
                              request.timeStamp,
                            ).getMinutes()}`
                          : 'N/A'}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7}>You don't have any archive requests</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default connect(mapStateToProps)(Requests);
