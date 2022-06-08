import { useEffect, useState } from 'react';
import { connect } from 'react-redux';

import Carousel from '../../components/carousel';
import media from '../../services/media.service';
import typo from '../../styles/components/typography.module.scss';
import styles from '../../styles/views/admin.module.scss';
import Activity from './dashboard-activity';
import Issues from './dashboard-issues';
import Metrics from './dashboard-metrics';

const mapStateToProps = (state) => {
  return {
    requests: state.user.requests,
    redux_movies: state.media.movies,
    redux_tv: state.media.tv,
  };
};

function AdminDashboard({ requests, redux_movies, redux_tv }) {
  const [activeRequests, setActiveRequests] = useState([]);

  useEffect(() => {
    let data = [];
    if (!requests) return;
    Object.keys(requests).forEach((id) => {
      let item = requests[id];
      if (item.type === 'movie' && redux_movies[id]) {
        data.push({
          title: redux_movies[id].title || false,
          poster: redux_movies[id].backdrop_path || false,
          logo: redux_movies[id].logo || false,
          id: id,
          requestType: 'movie',
          year: redux_movies[id].release_date || '',
          popularity: redux_movies[id].popularity || 0,
        });
      }

      if (item.type === 'tv' && redux_tv[id]) {
        data.push({
          title: redux_tv[id].name || false,
          poster: redux_tv[id].backdrop_path || false,
          logo: redux_tv[id].logo || false,
          id: id,
          requestType: 'tv',
          year: redux_tv[id].first_air_date || '',
          popularity: redux_tv[id].popularity || 0,
        });
      }
    });
    console.log(data);
    function sortRequests(a, b) {
      if (a.popularity > b.popularity) {
        return -1;
      }
      if (a.popularity < b.popularity) {
        return 1;
      }
      return 0;
    }
    data.sort(sortRequests);
    setActiveRequests(data);
  }, [redux_movies, redux_tv, requests]);

  useEffect(() => {
    if (!requests) return;
    let tv = [];
    let movie = [];
    Object.keys(requests).forEach((id) => {
      const request = requests[id];
      if (request.type === 'movie') movie.push(id);
      if (request.type === 'tv') tv.push(id);
    });
    media.batchLookup(tv, 'tv', false);
    media.batchLookup(movie, 'movie', false);
  }, [requests]);

  return (
    <div className={styles.dashboard}>
      <div className={styles.dashboard__requests}>
        {activeRequests.length > 0 ? (
          <Carousel
            key={`admin_requests`}
            id={`admin_requests`}
            title={'Active Requests'}
            data={activeRequests}
            type="request"
            link="/admin/requests"
          />
        ) : (
          <div className="container">
            <p className={`${typo.body} ${typo.uppercase} ${typo.bold} mb-1`}>
              Active Requests
            </p>
            <p className={`${typo.body} ${typo.medium} mb-5`}>No requests</p>
          </div>
        )}
      </div>
      <div className="container">
        <div className={styles.dashboard__grid}>
          <div className={styles.dashboard__metrics}>
            <p className={`${typo.body} ${typo.uppercase} ${typo.bold} mb-1`}>
              Server Details
            </p>
            <Metrics />
          </div>
          <div className={styles.dashboard__activity}>
            <p className={`${typo.body} ${typo.uppercase} ${typo.bold} mb-1`}>
              Server Activity
            </p>
            <Activity />
          </div>
          <div className={styles.dashboard__issues}>
            <p className={`${typo.body} ${typo.uppercase} ${typo.bold} mb-1`}>
              Active Issues
            </p>
            <Issues />
          </div>
        </div>
      </div>
    </div>
  );
}

export default connect(mapStateToProps)(AdminDashboard);
