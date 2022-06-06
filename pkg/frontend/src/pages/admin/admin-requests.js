import { useEffect, useState } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import { ReactComponent as ArrowIcon } from '../../assets/svg/arrow.svg';
import { ReactComponent as Spinner } from '../../assets/svg/spinner.svg';
import { ReactComponent as WarningIcon } from '../../assets/svg/warning.svg';
import Meta from '../../components/meta';
import {
  getRadarr,
  getRadarrOptions,
  getSonarr,
  getSonarrOptions,
} from '../../services/config.service';
import media from '../../services/media.service';
import {
  deleteRequest,
  getRequests,
  updateRequest,
} from '../../services/user.service';
import buttons from '../../styles/components/button.module.scss';
import input from '../../styles/components/input.module.scss';
import modal from '../../styles/components/modal.module.scss';
import typo from '../../styles/components/typography.module.scss';
import styles from '../../styles/views/admin.module.scss';

const mapStateToProps = (state) => {
  return {
    requests: state.user.requests,
    redux_movies: state.media.movies,
    redux_tv: state.media.tv,
    redux_users: state.user.users,
  };
};

function AdminRequests({
  requests,
  redux_movies,
  redux_tv,
  redux_users,
  newNotification,
}) {
  const [activeRequests, setActiveRequests] = useState([]);
  const [requestsLookup, setRequestsLookup] = useState(false);
  const [requestEdit, setRequestEdit] = useState(false);
  const [requestsToRemove, setRequestsToRemove] = useState([]);
  const [radarrServers, setRadarrServers] = useState([]);
  const [sonarrServers, setSonarrServers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingArr, setLoadingArr] = useState(true);

  useEffect(() => {
    async function init() {
      await getRequests(false);
      setLoading(false);
    }
    init();
    const heartbeat = setInterval(() => getRequests(false), 60000);
    return () => {
      clearInterval(heartbeat);
    };
  }, []);

  useEffect(() => {
    async function getArrs() {
      try {
        const [radarr, sonarr] = await Promise.all([getRadarr(), getSonarr()]);
        if (radarr) {
          await Promise.all(
            radarr.map(async (server) => {
              let options = await getArrOptions(server.id, 'radarr');
              server.options = options;
            }),
          );
        }
        if (sonarr) {
          await Promise.all(
            sonarr.map(async (server) => {
              let options = await getArrOptions(server.id, 'sonarr');
              server.options = options;
            }),
          );
        }
        setRadarrServers(radarr);
        setSonarrServers(sonarr);
        setLoadingArr(false);

        // processServers();
      } catch (err) {
        console.log(err);
      }
    }

    async function getArrOptions(id, type) {
      try {
        let settings =
          type === 'radarr'
            ? await getRadarrOptions(id)
            : await getSonarrOptions(id);
        if (settings.profiles.error || settings.paths.error) {
          return;
        }
        return {
          profiles: settings.profiles,
          paths: settings.paths,
          languages: settings.languages,
        };
      } catch {
        return {
          profiles: false,
          paths: false,
          languages: false,
        };
      }
    }

    getArrs();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    let data = [];
    if (!requests) return;
    Object.keys(requests).forEach((id) => {
      let item = requests[id];
      if (item.type === 'movie') {
        data.push({
          ...item,
          id: id,
          requestType: 'movie',
          year: redux_movies[id]
            ? new Date(redux_movies[id].release_date).getFullYear()
            : 'unknown',
        });
      }

      if (item.type === 'tv') {
        data.push({
          ...item,
          id: id,
          requestType: 'tv',
          year: redux_tv[id]
            ? new Date(redux_tv[id].first_air_date).getFullYear()
            : 'unknown',
        });
      }
    });
    setActiveRequests(data);
    let tv = [];
    let movie = [];
    Object.keys(requests).forEach((id) => {
      const request = requests[id];
      if (request.type === 'movie' && !redux_movies[id]) movie.push(id);
      if (request.type === 'tv' && !redux_tv[id]) tv.push(id);
    });

    if (!requestsLookup) lookups(tv, movie);

    async function lookups(tv, movie) {
      setRequestsLookup(true);
      await Promise.all(
        [media.batchLookup(tv, 'tv', false)],
        [media.batchLookup(movie, 'movie', false)],
      );
      setRequestsLookup(false);
    }
    // eslint-disable-next-line
  }, [requests]);

  async function removeReq(request, reason = false) {
    if (!request) return;
    try {
      setRequestsToRemove([...requestsToRemove, request.id]);
      await deleteRequest(request, reason);
      getRequests();
      setRequestEdit(false);
      newNotification({
        type: 'success',
        message: `Request: ${request.title} removed`,
      });
    } catch (e) {
      newNotification({
        type: 'error',
        message: `Failed to remove request: ${request.title}`,
      });
      console.log(e);
    }
  }

  async function updateReq(request, radarr, sonarr) {
    try {
      let servers = {};
      let type_server = {};
      if (request.type === 'tv') {
        type_server = sonarr;
      } else {
        type_server = radarr;
      }
      if (Object.keys(type_server).length > 0) {
        Object.keys(type_server).forEach((r) => {
          let server = type_server[r];
          if (server.active) {
            if (server.profile && server.path && server.language) {
              servers[r] = server;
            } else {
              throw 'Missing Path / Profile / Language';
            }
          }
        });
      }

      if (request.type === 'tv' && servers && !request.tvdb_id) {
        throw 'No TVDb ID Cannot add to Sonarr';
      }

      if (request.type === 'movie' && servers && !request.tmdb_id) {
        throw 'No TMDb ID Cannot add to Radarr';
      }

      let title = request.title;
      let approved = request.approved;

      try {
        await updateRequest(request, servers);
        setRequestEdit(false);
        getRequests(false);
        newNotification({
          type: 'success',
          message: approved
            ? `Request Updated: ${title}`
            : `Request Approved: ${title}`,
        });
      } catch (e) {
        console.log(e);
        throw 'Error updating request';
      }
    } catch (e) {
      newNotification({
        type: 'error',
        message: e,
      });
    }
  }

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
              removeReq={removeReq}
              requestsToRemove={requestsToRemove}
              loading={loading || loadingArr}
            />
          )}
        </div>
      </div>
      {requestEdit ? (
        <RequestModal
          request={requestEdit}
          setRequestEdit={setRequestEdit}
          radarrServers={radarrServers}
          sonarrServers={sonarrServers}
          updateReq={updateReq}
        />
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
  removeReq,
  requestsToRemove,
  loading,
}) {
  const [sortValue, setSortValue] = useState({
    sortBy: 'status',
    dir: 'DESC',
  });

  if (!requests) return null;

  function sortBy(a, b) {
    let sortVal = sortValue.sortBy;
    let av = a[sortVal];
    let bv = b[sortVal];
    if (sortVal === 'status') {
      av = a.process_stage ? a.process_stage.message : 0;
      bv = b.process_stage ? b.process_stage.message : 0;
      if (
        a.type === 'movie' &&
        a.children &&
        a.process_stage.message === 'In Cinemas'
      ) {
        av = '__0inCinema';
      }
      if (
        b.type === 'movie' &&
        b.children &&
        b.process_stage.message === 'In Cinemas'
      ) {
        bv = '__0inCinema';
      }
      if (
        a.type === 'movie' &&
        a.children &&
        a.process_stage.status === 'blue'
      ) {
        if (a.children[0].info.inCinemas) {
          av = `__${a.children[0].info.inCinemas}`;
        }
      }
      if (
        b.type === 'movie' &&
        b.children &&
        b.process_stage.status === 'blue'
      ) {
        if (b.children[0].info.inCinemas) {
          bv = `__${b.children[0].info.inCinemas}`;
        }
      }
      if (a.type === 'tv' && a.children && a.process_stage.status === 'blue') {
        if (a.children[0].info.firstAired) {
          av = `__${a.children[0].info.firstAired}`;
        }
      }
      if (b.type === 'tv' && b.children && b.process_stage.status === 'blue') {
        if (b.children[0].info.firstAired) {
          bv = `__${b.children[0].info.firstAired}`;
        }
      }
    }
    if (!av) av = '';
    if (!bv) bv = '';
    if (typeof av === 'string') av = av.toLowerCase();
    if (typeof bv === 'string') bv = bv.toLowerCase();
    if (av > bv) {
      return sortValue.dir === 'DESC' ? 1 : -1;
    }
    if (av < bv) {
      return sortValue.dir === 'DESC' ? -1 : 1;
    }
    return 0;
  }

  function sortCol(type) {
    if (!type) return;
    let sw = sortValue.sortBy === type ? true : false;
    let dir = sw ? (sortValue.dir === 'DESC' ? 'ASC' : 'DESC') : 'DESC';
    setSortValue({
      dir: dir,
      sortBy: type,
    });
  }

  function reqState(request) {
    if (!request.process_stage) return null;
    return (
      <span
        className={`${styles.requests__item__status__item} ${
          styles[
            `requests__item__status__item__${request.process_stage.status}`
          ]
        }`}
        title={request.process_stage.message || ''}
        data-status={request.process_stage.status}
        style={{ cursor: 'help' }}
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

  const requestsSorted = requests.sort(sortBy);

  return (
    <div className={styles.requests__table}>
      <div className={styles.requests__table__tr__header}>
        <div
          className={`${styles.requests__table__th} ${typo.body} ${typo.bold}`}
        >
          Request
        </div>
        <div
          className={`${styles.requests__table__th} ${styles.requests__table__th__sortable} ${typo.body} ${typo.bold}`}
          onClick={() => sortCol('title')}
        >
          Title
          <ArrowIcon
            className={`${styles.requests__table__th__arrow}
              ${
                sortValue.sortBy !== 'title'
                  ? ''
                  : sortValue.dir === 'DESC'
                  ? styles.requests__table__th__arrow__down
                  : styles.requests__table__th__arrow__up
              }`}
          />
        </div>
        <div
          className={`${styles.requests__table__th} ${styles.requests__table__th__sortable} ${typo.body} ${typo.bold}`}
          onClick={() => sortCol('year')}
        >
          Year
          <ArrowIcon
            className={`${styles.requests__table__th__arrow}
              ${
                sortValue.sortBy !== 'year'
                  ? ''
                  : sortValue.dir === 'DESC'
                  ? styles.requests__table__th__arrow__down
                  : styles.requests__table__th__arrow__up
              }`}
          />
        </div>
        <div
          className={`${styles.requests__table__th} ${styles.requests__table__th__sortable} ${typo.body} ${typo.bold}`}
          onClick={() => sortCol('type')}
        >
          Type
          <ArrowIcon
            className={`${styles.requests__table__th__arrow}
              ${
                sortValue.sortBy !== 'type'
                  ? ''
                  : sortValue.dir === 'DESC'
                  ? styles.requests__table__th__arrow__down
                  : styles.requests__table__th__arrow__up
              }`}
          />
        </div>
        <div
          className={`${styles.requests__table__th} ${styles.requests__table__th__sortable} ${typo.body} ${typo.bold}`}
          onClick={() => sortCol('status')}
        >
          Status
          <ArrowIcon
            className={`${styles.requests__table__th__arrow}
              ${
                sortValue.sortBy !== 'status'
                  ? ''
                  : sortValue.dir === 'DESC'
                  ? styles.requests__table__th__arrow__down
                  : styles.requests__table__th__arrow__up
              }`}
          />
        </div>
        <div
          className={`${styles.requests__table__th} ${styles.requests__table__th__sortable} ${typo.body} ${typo.bold}`}
        >
          User(s)
        </div>
        <div
          className={`${styles.requests__table__th} ${styles.requests__table__th__sortable} ${typo.body} ${typo.bold}`}
          onClick={() => sortCol('approved')}
        >
          Approved
          <ArrowIcon
            className={`${styles.requests__table__th__arrow}
              ${
                sortValue.sortBy !== 'approved'
                  ? ''
                  : sortValue.dir === 'DESC'
                  ? styles.requests__table__th__arrow__down
                  : styles.requests__table__th__arrow__up
              }`}
          />
        </div>
        <div
          className={`${styles.requests__table__th} ${typo.body} ${typo.bold}`}
        >
          Actions
        </div>
      </div>

      {requestsSorted.map((request) => {
        let id = request.id;
        let poster = false;
        let releaseDate = false;
        let logo = false;
        if (request.type === 'movie' && redux_movies[id]) {
          poster = redux_movies[id].backdrop_path;
          releaseDate = redux_movies[id].release_date;
          logo = redux_movies[id].logo;
        }
        if (request.type === 'tv' && redux_tv[id]) {
          poster = redux_tv[id].backdrop_path;
          releaseDate = redux_tv[id].first_air_date;
          logo = redux_tv[id].logo;
        }
        return (
          <div
            className={`${styles.requests__item} ${
              requestsToRemove && requestsToRemove.includes(request.id)
                ? styles.requests__item__tbr
                : ''
            }`}
            key={`request_item_${request.type}_${request.id}`}
          >
            <div
              className={
                !loading || request.children
                  ? `${styles.requests__item__loading__icon} ${styles.requests__item__loading__icon__hide}`
                  : styles.requests__item__loading__icon
              }
            >
              <Spinner />
            </div>
            <div className={styles.requests__table__tr}>
              <div className={styles.requests__table__td}>
                <Link
                  to={`/${request.requestType}/${request.id}`}
                  className={styles.requests__item__img__wrap}
                >
                  <div className={styles.requests__item__img}>
                    {!request.tvdb_id ? (
                      <WarningIcon
                        className={styles.requests__item__img__warning}
                        title="TVDb ID not set"
                      />
                    ) : null}
                    {logo ? (
                      <LazyLoadImage
                        className={styles.requests__item__img__logo}
                        src={logo}
                        effect="opacity"
                      />
                    ) : (
                      <p className={`${typo.body} ${typo.bold}`}>
                        {request.title || ''}
                      </p>
                    )}
                    {poster ? (
                      <LazyLoadImage
                        className={styles.requests__item__img__image}
                        src={`https://image.tmdb.org/t/p/w500${poster}`}
                        alt={request.title || ''}
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
                  style={{ cursor: 'help' }}
                  title={releaseDate || ''}
                >
                  {releaseDate
                    ? new Date(releaseDate).getFullYear()
                    : 'Unknown'}
                </p>
              </div>
              <div className={styles.requests__table__td}>
                <p
                  className={`${typo.body} ${typo.medium}`}
                  style={{ textTransform: 'capitalize' }}
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
                    style={{ cursor: 'help' }}
                  >
                    Sonarr
                  </span>
                ) : null}
                {request.radarrId.length > 0 ? (
                  <span
                    className={`${styles.requests__item__status__item} ${styles.requests__item__status__item__radarr}`}
                    title="Radarr"
                    style={{ cursor: 'help' }}
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
                      style={{ cursor: 'help' }}
                      title={user.title || ''}
                    >
                      {user.thumbnail && user.thumbnail !== 'false' ? (
                        <LazyLoadImage
                          className={styles.requests__item__usr__image}
                          src={user.thumbnail}
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
                        request.approved ? 'yes' : 'no'
                      }`
                    ]
                  }`}
                >
                  {request.approved ? 'Y' : 'N'}
                </div>
              </div>
              <div className={styles.requests__table__td}>
                <button
                  className={`${styles.requests__item__edit} ${typo.small} ${typo.uppercase} ${typo.medium}`}
                  onClick={() => setRequestEdit(request)}
                >
                  Edit
                </button>
                <button
                  className={`${styles.requests__item__delete} ${typo.small} ${typo.uppercase} ${typo.medium}`}
                  onClick={() => removeReq(request)}
                >
                  Delete
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
          let ids = [];
          return server.status.map((child, row) => {
            if (!child || ids.includes(child.downloadId)) return null;
            ids.push(child.downloadId);
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
                    style={{ textTransform: 'capitalize' }}
                  >
                    <strong>Status:</strong> {child.status}
                  </p>
                </div>
                <div className={styles.requests__item__child__eta}>
                  <p className={`${typo.small}`}>
                    <strong>ETA:</strong> {child.timeleft || '-'}
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

function RequestModal({
  request,
  setRequestEdit,
  sonarrServers,
  radarrServers,
  updateReq,
}) {
  const [radarr, setRadarr] = useState({});
  const [sonarr, setSonarr] = useState({});
  const [hasEdited, setHasEdited] = useState(false);
  const [requestState, setRequestState] = useState(request);

  useEffect(() => {
    let edit_radarr = {};
    let edit_sonarr = {};
    if (!request) return;

    if (request.type === 'movie') {
      if (request.radarrId.length > 0) {
        request.radarrId.forEach((r, i) => {
          let id = Object.keys(r)[0];
          let child =
            request.children && request.children[i]
              ? request.children[i].info
              : {};
          let path = false;
          if (child.path) {
            if (child.path.lastIndexOf('/') > 0) {
              path = child.path.substring(0, child.path.lastIndexOf('/'));
            } else if (child.path.lastIndexOf('\\') > 0) {
              path = child.path.substring(0, child.path.lastIndexOf('\\'));
            }
          }
          edit_radarr[id] = {
            active: true,
            profile: child.qualityProfileId ? child.qualityProfileId : false,
            path: path,
          };
        });
      } else {
        if (request.defaults) {
          Object.keys(request.defaults).forEach((s) => {
            let id = s;
            let server = request.defaults[s];
            edit_radarr[id] = {
              active: true,
              profile: server.profile,
              path: server.path,
            };
          });
        }
      }
    }
    if (request.type === 'tv') {
      if (request.sonarrId.length > 0) {
        request.sonarrId.forEach((r, i) => {
          let id = Object.keys(r)[0];
          let child =
            request.children && request.children[i]
              ? request.children[i].info
              : {};
          let path = false;
          if (child.rootFolderPath) {
            path = child.rootFolderPath.slice(0, -1);
          }
          edit_sonarr[id] = {
            active: true,
            profile: child.qualityProfileId ? child.qualityProfileId : false,
            path: path,
          };
        });
      } else {
        if (request.defaults) {
          Object.keys(request.defaults).forEach((s) => {
            let id = s;
            let server = request.defaults[s];
            edit_sonarr[id] = {
              active: true,
              profile: server.profile,
              path: server.path,
            };
          });
        }
      }
    }
    setRadarr(edit_radarr);
    setSonarr(edit_sonarr);
    setRequestState(request);
  }, [request, sonarrServers, radarrServers]);

  function statusChange(e) {
    const target = e.target;
    let value = target.value;
    setRequestState({ ...requestState, manualStatus: value });
    setHasEdited(true);
  }

  function changeServerSettings(e) {
    const target = e.target;
    const name = target.name;
    let value = target.type === 'checkbox' ? target.checked : target.value;
    let type = target.dataset.type;
    let id = target.dataset.id;

    if (type === 'radarr')
      setRadarr({
        ...radarr,
        [id]: {
          ...radarr[id],
          [name]: value,
        },
      });

    if (type === 'sonarr')
      setSonarr({
        ...sonarr,
        [id]: {
          ...sonarr[id],
          [name]: value,
        },
      });

    setHasEdited(true);
  }

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
        <div className={modal.content}>
          {request ? (
            <>
              {request.type === 'tv' && !request.tvdb_id ? (
                <p
                  className={`${typo.body} ${typo.bold} ${styles.warningText}`}
                >
                  <WarningIcon /> No TVDb ID
                </p>
              ) : null}
              <p
                className={`${typo.body} ${typo.bold} ${styles.requestEdit__title}`}
              >
                {request.title}
              </p>
              {request.type === 'tv' && !request.tvdb_id ? (
                <div className={styles.requestEdit__wrap}>
                  <p
                    className={`${typo.body} ${typo.bold} ${styles.warningText}`}
                  >
                    <WarningIcon /> Can&apos;t send to DVR without TVDB ID
                  </p>
                </div>
              ) : (
                <div className={styles.requestEdit__wrap}>
                  {request.type === 'tv' ? (
                    sonarrServers && sonarrServers.length > 0 ? (
                      sonarrServers.map((server) => {
                        return (
                          <RenderRequestEdit
                            key={`req_m_${request.id}_${server.id}`}
                            server={server}
                            request={request}
                            type="sonarr"
                            radarr={radarr}
                            sonarr={sonarr}
                            changeServerSettings={changeServerSettings}
                          />
                        );
                      })
                    ) : (
                      <p className={`${typo.body}`}>No Sonarr Servers</p>
                    )
                  ) : radarrServers && radarrServers.length > 0 ? (
                    radarrServers.map((server) => {
                      return (
                        <RenderRequestEdit
                          key={`req_m_${request.id}_${server.id}`}
                          server={server}
                          request={request}
                          type="radarr"
                          radarr={radarr}
                          sonarr={sonarr}
                          changeServerSettings={changeServerSettings}
                        />
                      );
                    })
                  ) : (
                    <p className={`${typo.body}`}>No Radarr Servers</p>
                  )}
                  {request.approved ? null : (
                    <p className={`${typo.small} ${typo.bold}`}>
                      Submitting will also immediately approve this request
                    </p>
                  )}
                </div>
              )}
              <p className={`${typo.body} ${styles.requestEdit__label}`}>
                Manually Set Status
              </p>
              <select
                name="manualStatus"
                value={requestState.manualStatus || ''}
                onChange={statusChange}
                className={input.select__light}
              >
                <option value="">None</option>
                <option value="3">Processing</option>
                <option value="4">Finalising</option>
                <option value="5">Complete</option>
              </select>
              <p className={`${typo.small} ${styles.requestEdit__under}`}>
                This will only be used for untracked requests
              </p>
            </>
          ) : null}
          <button
            className={`${buttons.primary} ${styles.requestEdit__btn}`}
            onClick={() => updateReq(requestState, radarr, sonarr)}
            disabled={hasEdited ? false : true}
          >
            Update
          </button>
          <button
            className={`${buttons.primary__red} ${styles.requestEdit__btn}`}
            onClick={() => setRequestEdit(false)}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function RenderRequestEdit({
  server,
  type,
  request,
  changeServerSettings,
  radarr,
  sonarr,
}) {
  let editable = request[`${type}Id`].length === 0;
  const edit = {
    radarr: radarr,
    sonarr: sonarr,
  };

  return (
    <div
      className="request-edit--server--wrap"
      key={`${type}_server_${server.id}`}
    >
      <p className={`${typo.body} ${typo.bold} ${styles.requestEdit__server}`}>
        Server: {server.title}
      </p>
      <div>
        <div className={input.checkboxes__item}>
          <input
            data-type={type}
            data-id={server.id}
            type="checkbox"
            checked={
              edit[type][server.id] ? edit[type][server.id].active : false
            }
            name={'active'}
            onChange={changeServerSettings}
            disabled={!editable}
          />
          <p className={typo.body}>Use this server</p>
        </div>
      </div>

      {server.options ? (
        <>
          <p className={`${typo.body} ${styles.requestEdit__label}`}>Profile</p>

          <select
            className={input.select__light}
            data-type={type}
            data-id={server.id}
            name="profile"
            value={
              edit[type][server.id] ? edit[type][server.id].profile : false
            }
            onChange={changeServerSettings}
            disabled={!editable}
          >
            <option value="">Please choose</option>
            {server.options.profiles ? (
              server.options.profiles.map((profile) => {
                return (
                  <option
                    key={`${type}_profile_${server.id}_${profile.id}`}
                    value={profile.id}
                  >
                    {profile.name}
                  </option>
                );
              })
            ) : (
              <option value=""></option>
            )}
          </select>
          <p className={`${typo.body} ${styles.requestEdit__label}`}>
            Root Path
          </p>
          <select
            className={input.select__light}
            data-type={type}
            data-id={server.id}
            name="path"
            value={
              edit[type][server.id]?.path ? edit[type][server.id]?.path : false
            }
            data-value={
              edit[type][server.id]?.path ? edit[type][server.id]?.path : false
            }
            onChange={changeServerSettings}
            disabled={!editable}
          >
            <option value="">Please choose</option>
            {server.options.paths ? (
              server.options.paths.map((path) => {
                return (
                  <option
                    key={`${type}_profile_${server.id}_${path.id}`}
                    value={path.path}
                  >
                    {path.path}
                  </option>
                );
              })
            ) : (
              <option value=""></option>
            )}
          </select>

          <p className={`${typo.body} ${styles.requestEdit__label}`}>
            Language
          </p>
          <select
            className={input.select__light}
            data-type={type}
            data-id={server.id}
            name="language"
            data-value={
              edit[type][server.id] ? edit[type][server.id].language : false
            }
            value={
              edit[type][server.id] ? edit[type][server.id].language : false
            }
            onChange={changeServerSettings}
            disabled={!editable}
          >
            <option value="">Please choose</option>
            {server.options.languages ? (
              server.options.languages.map((lang) => {
                return (
                  <option
                    key={`${type}_profile_${server.id}_${lang.id}`}
                    value={lang.id}
                  >
                    {lang.name}
                  </option>
                );
              })
            ) : (
              <option value=""></option>
            )}
          </select>
        </>
      ) : (
        <>
          <p className={`${typo.body} ${styles.requestEdit__label}`}>Profile</p>
          <select className={input.select__light} disabled={true}>
            <option value="">Loading...</option>
          </select>
          <p className={`${typo.body} ${styles.requestEdit__label}`}>
            Root Path
          </p>
          <select className={input.select__light} disabled={true}>
            <option value="">Loading...</option>
          </select>
        </>
      )}
      {editable ? null : (
        <p className={`${typo.small} ${styles.requestEdit__under}`}>
          {`These settings cannot be edited once sent to `}
          <span style={{ textTransform: 'capitalize' }}>{type}</span>
        </p>
      )}
    </div>
  );
}

export default connect(mapStateToProps)(AdminRequests);
