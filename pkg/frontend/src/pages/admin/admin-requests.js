import Meta from "../../components/meta";
import { connect } from "react-redux";
import { useEffect, useState } from "react";
import media from "../../services/media.service";
import styles from "../../styles/views/admin.module.scss";
import typo from "../../styles/components/typography.module.scss";
import { Link } from "react-router-dom";
import { LazyLoadImage } from "react-lazy-load-image-component";

const mapStateToProps = (state) => {
  return {
    requests: state.user.requests,
    redux_movies: state.media.movies,
    redux_tv: state.media.tv,
    redux_users: state.user.users,
  };
};

function AdminRequests({ requests, redux_movies, redux_tv, redux_users }) {
  const [activeRequests, setActiveRequests] = useState([]);

  useEffect(() => {
    let data = [];
    if (!requests) return;
    Object.keys(requests).forEach((id) => {
      let item = requests[id];
      if (item.type === "movie" && redux_movies[id]) {
        data.push({
          ...item,
          title: redux_movies[id].title || false,
          poster: redux_movies[id].backdrop_path || false,
          logo: redux_movies[id].logo || false,
          id: id,
          requestType: "movie",
          releaseDate: redux_movies[id].release_date,
        });
      }

      if (item.type === "tv" && redux_tv[id]) {
        data.push({
          ...item,
          title: redux_tv[id].name || false,
          poster: redux_tv[id].backdrop_path || false,
          logo: redux_tv[id].logo || false,
          id: id,
          requestType: "tv",
          releaseDate: redux_tv[id].first_air_date,
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
    <>
      <div className="container">
        <Meta title="Admin Requests" />
        <div className={styles.requests__wrap}>
          <div className={styles.requests__title}>
            <p className={`${typo.title} ${typo.bold}`}>Active Requests</p>
          </div>
          {activeRequests.length === 0 ? (
            <div>No requests</div>
          ) : (
            <ActiveRequestsTable
              requests={activeRequests}
              users={redux_users}
            />
          )}
        </div>
      </div>
    </>
  );
}

function ActiveRequestsTable({ requests, users }) {
  if (!requests) return null;

  function reqState(request) {
    if (!request.process_stage) return null;
    return (
      <span
        className={`requests--status requests--status__${request.process_stage.status}`}
      >
        {request.process_stage.message}
      </span>
    );
  }

  function getUser(id) {
    if (!users) return null;
    const user = users.filter((u) => u.id.toString() === id.toString());
    console.log(user);
    if (user) return user[0];

    return null;
  }

  return (
    <table className={styles.requests__table}>
      <thead>
        <tr>
          <th></th>
          <th>Title</th>
          <th>Year</th>
          <th>Type</th>
          <th>Status</th>
          <th>User(s)</th>
          <th>Approved</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {requests.map((request) => {
          return (
            <tr key={`request_item_${request.type}_${request.id}`}>
              <td>
                <Link
                  to={`/${request.requestType}/${request.id}`}
                  className={styles.requests__item__img__wrap}
                >
                  <div className={styles.requests__item__img}>
                    {request.logo ? (
                      <LazyLoadImage
                        className={styles.requests__item__img__logo}
                        src={request.logo}
                        effect="opacity"
                      />
                    ) : (
                      <p className={`${typo.smtitle} ${typo.medium}`}>
                        {request.title}
                      </p>
                    )}
                    {request.poster ? (
                      <LazyLoadImage
                        className={styles.requests__item__img__image}
                        src={`https://image.tmdb.org/t/p/w500${request.poster}`}
                        alt={request.title}
                      />
                    ) : null}
                  </div>
                </Link>
              </td>
              <td>{request.title}</td>
              <td>{new Date(request.releaseDate).getFullYear()}</td>
              <td>{request.type}</td>
              <td>
                {reqState(request)}
                {request.sonarrId.length > 0 ? (
                  <span className="requests--status requests--status__sonarr">
                    Sonarr
                  </span>
                ) : null}
                {request.radarrId.length > 0 ? (
                  <span className="requests--status requests--status__radarr">
                    Radarr
                  </span>
                ) : null}
              </td>
              <td>
                {request.users.map((userId, i) => {
                  const user = getUser(userId);
                  if (!user) return null;
                  console.log(user);
                  return (
                    <div
                      key={`request_item_${request.type}_${request.id}_${userId}_${i}`}
                      className={styles.requests__item__usr}
                      title={user.title}
                    >
                      <LazyLoadImage
                        className={styles.requests__item__usr__image}
                        src={user.thumb}
                        alt={user.title}
                      />
                    </div>
                  );
                })}
              </td>
              <td></td>
              <td></td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default connect(mapStateToProps)(AdminRequests);
