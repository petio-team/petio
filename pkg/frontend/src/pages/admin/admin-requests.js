import Meta from "../../components/meta";
import { connect } from "react-redux";
import { useEffect, useState } from "react";
import media from "../../services/media.service";
import styles from "../../styles/views/admin.module.scss";
import typo from "../../styles/components/typography.module.scss";
import modal from "../../styles/components/modal.module.scss";
import { Link } from "react-router-dom";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { getRequests } from "../../services/user.service";

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
  const [requestsLookup, setRequestsLookup] = useState(false);
  const [requestEdit, setRequestEdit] = useState(false);

  useEffect(() => {
    getRequests(false);
    const heartbeat = setInterval(() => getRequests(false), 60000);
    return () => {
      clearInterval(heartbeat);
    };
  }, []);

  useEffect(() => {
    let data = [];
    if (!requests) return;
    Object.keys(requests).forEach((id) => {
      let item = requests[id];
      if (item.type === "movie") {
        data.push({
          ...item,
          id: id,
          requestType: "movie",
        });
      }

      if (item.type === "tv") {
        data.push({
          ...item,
          id: id,
          requestType: "tv",
        });
      }
    });
    setActiveRequests(data);
    let tv = [];
    let movie = [];
    Object.keys(requests).forEach((id) => {
      const request = requests[id];
      if (request.type === "movie" && !redux_movies[id]) movie.push(id);
      if (request.type === "tv" && !redux_tv[id]) tv.push(id);
    });

    if (!requestsLookup) lookups(tv, movie);

    async function lookups(tv, movie) {
      setRequestsLookup(true);
      await Promise.all(
        [media.batchLookup(tv, "tv", false)],
        [media.batchLookup(movie, "movie", false)]
      );
      setRequestsLookup(false);
    }
    // eslint-disable-next-line
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
              redux_movies={redux_movies}
              redux_tv={redux_tv}
              setRequestEdit={setRequestEdit}
            />
          )}
        </div>
      </div>
      {requestEdit ? (
        <RequestModal request={requestEdit} setRequestEdit={setRequestEdit} />
      ) : null}
    </>
  );
}

function ActiveRequestsTable({
  requests,
  users,
  redux_movies,
  redux_tv,
  setRequestEdit,
}) {
  if (!requests) return null;

  function reqState(request) {
    if (!request.process_stage) return null;
    return (
      <span
        className={`${styles.requests__item__status__item} ${
          styles[
            `requests__item__status__item__${request.process_stage.status}`
          ]
        }`}
        title={request.process_stage.message || ""}
        data-status={request.process_stage.status}
        style={{ cursor: "help" }}
      >
        {request.process_stage.message}
      </span>
    );
  }

  function getUser(id) {
    if (!users) return null;
    const user = users.filter((u) => u.id.toString() === id.toString());
    if (user) return user[0];

    return null;
  }

  return (
    <div className={styles.requests__table}>
      <div className={styles.requests__table__tr__header}>
        <div className={styles.requests__table__th}></div>
        <div
          className={`${styles.requests__table__th} ${typo.body} ${typo.bold}`}
        >
          Title
        </div>
        <div
          className={`${styles.requests__table__th} ${typo.body} ${typo.bold}`}
        >
          Year
        </div>
        <div
          className={`${styles.requests__table__th} ${typo.body} ${typo.bold}`}
        >
          Type
        </div>
        <div
          className={`${styles.requests__table__th} ${typo.body} ${typo.bold}`}
        >
          Status
        </div>
        <div
          className={`${styles.requests__table__th} ${typo.body} ${typo.bold}`}
        >
          User(s)
        </div>
        <div
          className={`${styles.requests__table__th} ${typo.body} ${typo.bold}`}
        >
          Approved
        </div>
        <div
          className={`${styles.requests__table__th} ${typo.body} ${typo.bold}`}
        >
          Actions
        </div>
      </div>

      {requests.map((request) => {
        let id = request.id;
        let poster = false;
        let releaseDate = false;
        let logo = false;
        if (request.type === "movie" && redux_movies[id]) {
          poster = redux_movies[id].backdrop_path;
          releaseDate = redux_movies[id].release_date;
          logo = redux_movies[id].logo;
        }
        if (request.type === "tv" && redux_tv[id]) {
          poster = redux_tv[id].backdrop_path;
          releaseDate = redux_tv[id].first_air_date;
          logo = redux_tv[id].logo;
        }
        return (
          <div
            className={styles.requests__item}
            key={`request_item_${request.type}_${request.id}`}
          >
            <div className={styles.requests__table__tr}>
              <div className={styles.requests__table__td}>
                <Link
                  to={`/${request.requestType}/${request.id}`}
                  className={styles.requests__item__img__wrap}
                >
                  <div className={styles.requests__item__img}>
                    {logo ? (
                      <LazyLoadImage
                        className={styles.requests__item__img__logo}
                        src={logo}
                        effect="opacity"
                      />
                    ) : (
                      <p className={`${typo.body} ${typo.bold}`}>
                        {request.title || ""}
                      </p>
                    )}
                    {poster ? (
                      <LazyLoadImage
                        className={styles.requests__item__img__image}
                        src={`https://image.tmdb.org/t/p/w500${poster}`}
                        alt={request.title || ""}
                      />
                    ) : null}
                  </div>
                </Link>
              </div>
              <div className={styles.requests__table__td}>
                <p className={`${typo.body} ${typo.medium}`}>{request.title}</p>
              </div>
              <div className={styles.requests__table__td}>
                <p
                  className={`${typo.body} ${typo.medium}`}
                  style={{ cursor: "help" }}
                  title={releaseDate || ""}
                >
                  {releaseDate
                    ? new Date(releaseDate).getFullYear()
                    : "Unknown"}
                </p>
              </div>
              <div className={styles.requests__table__td}>
                <p
                  className={`${typo.body} ${typo.medium}`}
                  style={{ textTransform: "capitalize" }}
                >
                  {request.type}
                </p>
              </div>
              <div
                className={`${styles.requests__table__td} ${styles.requests__item__status}`}
              >
                {reqState(request)}
                {request.sonarrId.length > 0 ? (
                  <span
                    className={`${styles.requests__item__status__item} ${styles.requests__item__status__item__sonarr}`}
                    title="Sonarr"
                    style={{ cursor: "help" }}
                  >
                    Sonarr
                  </span>
                ) : null}
                {request.radarrId.length > 0 ? (
                  <span
                    className={`${styles.requests__item__status__item} ${styles.requests__item__status__item__radarr}`}
                    title="Radarr"
                    style={{ cursor: "help" }}
                  >
                    Radarr
                  </span>
                ) : null}
              </div>
              <div
                className={`${styles.requests__table__td} ${styles.requests__item__usr__wrap}`}
              >
                {request.users.map((userId, i) => {
                  const user = getUser(userId);
                  if (!user) return null;

                  return (
                    <div
                      key={`request_item_${request.type}_${request.id}_${userId}_${i}`}
                      className={styles.requests__item__usr}
                      style={{ cursor: "help" }}
                      title={user.title || ""}
                    >
                      {user.thumb && user.thumb !== "false" ? (
                        <LazyLoadImage
                          className={styles.requests__item__usr__image}
                          src={user.thumb}
                          alt={user.title}
                        />
                      ) : (
                        <p>{user.title.charAt(0)}</p>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className={styles.requests__table__td}>
                <div
                  className={`${styles.requests__item__approved} ${
                    styles[
                      `requests__item__approved__${
                        request.approved ? "yes" : "no"
                      }`
                    ]
                  }`}
                >
                  {request.approved ? "Y" : "N"}
                </div>
              </div>
              <div className={styles.requests__table__td}>
                <button
                  className={`${styles.requests__item__edit} ${typo.small} ${typo.uppercase} ${typo.medium}`}
                  onClick={() => setRequestEdit(request)}
                >
                  Edit
                </button>
              </div>
            </div>
            <RequestChildren request={request} />
          </div>
        );
      })}
    </div>
  );
}

function RequestChildren({ request }) {
  if (!request.children) {
    return null;
  }
  if (request.children.length === 0) {
    return null;
  }

  return (
    <div className={styles.requests__item__children}>
      {request.children.map((server) => {
        if (server.status.length > 0) {
          console.log(server);
          let ids = [];
          return server.status.map((child, row) => {
            if (!child || ids.includes(child.downloadId)) return null;
            ids.push(child.downloadId);
            console.log(child);
            // return <p key={`child__${child.id}`}>{child.title}</p>;
            let prog = (child.sizeleft / child.size - 1) * -1 * 100;
            return (
              <div className={styles.requests__item__child}>
                <div className={styles.requests__item__child__server}>
                  <p className={`${typo.small}`}>
                    <strong>Server:</strong> {server.info.serverName}
                  </p>
                </div>
                <div className={styles.requests__item__child__quality}>
                  <p className={`${typo.small}`}>
                    <strong>Quality:</strong> {child.quality.quality.name}
                  </p>
                </div>
                <div className={styles.requests__item__child__status}>
                  <p
                    className={`${typo.small}`}
                    style={{ textTransform: "capitalize" }}
                  >
                    <strong>Status:</strong> {child.status}
                  </p>
                </div>
                <div className={styles.requests__item__child__eta}>
                  <p className={`${typo.small}`}>
                    <strong>ETA:</strong> {child.timeleft || "-"}
                  </p>
                </div>
                <div className={styles.requests__item__child__progress}>
                  <div className={styles.requests__item__child__progress__bar}>
                    <div
                      className={
                        child.status
                          ? styles[
                              `requests__item__child__progress__state__${child.status}`
                            ]
                          : styles.requests__item__child__progress__state
                      }
                      style={{ width: `${prog}%` }}
                    ></div>
                  </div>
                </div>
                <div className={styles.requests__item__child__info}>
                  <p className={`${typo.small}`}>
                    <strong>Path:</strong> {child.outputPath}
                  </p>
                  <p className={`${typo.small}`}>
                    <strong>Release:</strong> {child.title}
                  </p>
                </div>
              </div>
            );
          });
        } else {
          return null;
        }
      })}
    </div>
  );
}

function RequestModal({ request, setRequestEdit }) {
  return (
    <div className={modal.wrap}>
      <div className={modal.main}>
        <div className={modal.close}>
          <p
            className={`${typo.small} ${typo.uppercase} ${typo.medium}`}
            onClick={() => setRequestEdit(false)}
          >
            Close
          </p>
        </div>
        <div className={modal.title}>
          <p className={`${typo.small} ${typo.uppercase} ${typo.medium}`}>
            Edit Request: {request.title}
          </p>
        </div>
        <div className={modal.content}>content</div>
      </div>
    </div>
  );
}

export default connect(mapStateToProps)(AdminRequests);
