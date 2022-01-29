import { connect } from "react-redux";
import styles from "../../styles/views/admin.module.scss";
// import typo from "../../styles/components/typography.module.scss";
import Carousel from "../../components/carousel";
import Metrics from "./dashboard-metrics";
import Activity from "./dashboard-activity";
import Issues from "./dashboard-issues";
import { useEffect, useState } from "react";
import media from "../../services/media.service";

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
      if (item.type === "movie" && redux_movies[id]) {
        data.push({
          title: redux_movies[id].title || false,
          poster: redux_movies[id].backdrop_path || false,
          logo: redux_movies[id].logo || false,
          id: id,
        });
      }

      if (item.type === "tv" && redux_tv[id]) {
        data.push({
          title: redux_tv[id].name || false,
          poster: redux_tv[id].backdrop_path || false,
          logo: redux_tv[id].logo || false,
          id: id,
        });
      }
    });
    setActiveRequests(data);
  }, [redux_movies, redux_tv, requests]);

  useEffect(() => {
    if (!requests) return;
    let tv = [];
    let movie = [];
    Object.keys(requests).forEach((id) => {
      const request = requests[id];
      if (request.type === "movie") movie.push(id);
      if (request.type === "tv") tv.push(id);
    });
    media.batchLookup(tv, "tv", false);
    media.batchLookup(movie, "movie", false);
  }, [requests]);

  return (
    <div className={styles.dashboard}>
      <div className={styles.dasboard__requests}>
        <Carousel
          key={`admin_requests`}
          id={`admin_requests`}
          title={"Active Requests"}
          data={activeRequests}
          type="request"
          link="/admin/requests"
        />
      </div>
      <div className="container">
        <div className={styles.dashboard__grid}>
          <div className={styles.dashboard__metrics}>
            <div className={styles.dashboard__module}>
              <Metrics />
            </div>
          </div>
          <div className={styles.dashboard__activity}>
            <div className={styles.dashboard__module}>
              <Activity />
            </div>
          </div>
          <div className={styles.dashboard__issues}>
            <div className={styles.dashboard__module}>
              <Issues />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default connect(mapStateToProps)(AdminDashboard);
