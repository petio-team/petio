import { useEffect, useState } from "react";
import { addNewRequest } from "../services/user.service";
import buttons from "../styles/components/button.module.scss";
import styles from "../styles/views/movie.module.scss";
import typo from "../styles/components/typography.module.scss";
import { getMobileOperatingSystem } from "../helpers/getOs";

export default function RequestButton({
  data,
  globalRequests,
  currentUser,
  type = "movie",
  updateRequests,
  newNotification,
}) {
  const [pending, setPending] = useState(false);
  const [userHasRequested, setUserHasRequested] = useState(false);
  const [requestCount, setRequestCount] = useState(0);
  const [versionsOpen, setVersionsOpen] = useState(false);

  useEffect(() => {
    if (
      globalRequests &&
      globalRequests[data.id] &&
      globalRequests[data.id].users
    ) {
      setRequestCount(globalRequests[data.id].users.length);
      if (globalRequests[data.id].users.includes(currentUser.id)) {
        setUserHasRequested(true);
      }
    }
  }, [globalRequests, currentUser.id, data.id]);

  async function request() {
    if (
      globalRequests &&
      globalRequests[data.id] &&
      globalRequests[data.id].users
    ) {
      if (globalRequests[data.id].users.includes(currentUser.id)) {
        newNotification({
          type: "error",
          message: `You've already requested ${data.title || data.name}`,
        });
        return;
      }
    }
    setPending(true);
    const notify = newNotification({
      type: "loading",
      message: `Requesting ${data.title || data.name}`,
    });
    let request = {};
    if (type === "movie")
      request = {
        id: data.id,
        imdb_id: data.imdb_id,
        tmdb_id: data.id,
        tvdb_id: "n/a",
        title: data.title,
        thumb: data.poster_path,
        type: type,
      };
    if (type === "tv") {
      let seasons = {};
      if (data.seasons.length > 0)
        data.seasons.forEach((season) => {
          seasons[season.season_number] = true;
        });
      request = {
        id: data.id,
        tmdb_id: data.id,
        tvdb_id: data.tvdb_id,
        imdb_id: data.imdb_id,
        title: data.name,
        type: "tv",
        thumb: data.poster_path,
        seasons: seasons,
      };
    }
    try {
      const res = await addNewRequest(request, currentUser);
      if (res.error) {
        newNotification({
          type: "error",
          message: `Request Failed: ${res.message}`,
        });
        throw res;
      }
      newNotification({
        type: "success",
        message: `New Request added: ${data.title || data.name}`,
        id: notify,
      });
    } catch (err) {
      console.log(err);
      newNotification({
        type: "error",
        message: `Request Failed: ${data.title || data.name}`,
        id: notify,
      });
    }
    setPending(false);
    updateRequests();
  }

  function openInApp(ratingKey, serverKey) {
    const OS = getMobileOperatingSystem();
    var now = new Date().valueOf();
    setTimeout(function () {
      if (new Date().valueOf() - now > 100) return;
      window.open(
        `https://app.plex.tv/desktop#!/server/${serverKey}/details?key=%2Flibrary%2Fmetadata%2F${ratingKey}`,
        "_blank"
      );
    }, 25);

    if (OS === "iOS")
      window.location = `plex://${
        type === "movie" ? "play" : "preplay"
      }/?metadataKey=%2Flibrary%2Fmetadata%2F${ratingKey}&metadataType=1&server=${serverKey}`;
    if (OS === "Android")
      window.open(
        `plex://server://${serverKey}/com.plexapp.plugins.library/library/metadata/${ratingKey}`
      );
  }

  function requestButton() {
    let counter = null;
    if (requestCount > 0)
      counter = <div className={`${buttons.counter}`}>{requestCount}</div>;
    if (data.on_server) {
      const onServer = data.on_server;
      if (
        !onServer.serverKey ||
        !onServer.versions ||
        onServer.versions.length === 0
      )
        return (
          <>
            <button
              className={`${buttons.secondary} ${styles.actions__request__main_btn}`}
              style={{ pointerEvents: "none" }}
            >
              On Plex
            </button>
          </>
        );
      if (onServer.versions.length > 1)
        return (
          <>
            <div className={styles.actions__request__dropdown__wrap}>
              <button
                className={`${buttons.secondary} ${
                  styles.actions__request__dropdown__button
                } ${
                  versionsOpen
                    ? styles.actions__request__dropdown__button__open
                    : ""
                }`}
                onClick={() => setVersionsOpen(!versionsOpen)}
              >
                Watch now
                <div className={styles.actions__request__dropdown__arrow}></div>
              </button>
              <div
                className={`${styles.actions__request__dropdown__options} ${
                  versionsOpen
                    ? styles.actions__request__dropdown__options__open
                    : ""
                }`}
              >
                {onServer.versions.map((version) => {
                  return (
                    <div
                      onClick={() =>
                        openInApp(version.ratingKey, onServer.serverKey)
                      }
                      key={`watch__${version.ratingKey}`}
                      className={styles.actions__request__dropdown__option}
                    >
                      <p
                        className={`${typo.body} ${typo.medium}`}
                      >{`Watch now in ${
                        version.resolution === "720" ||
                        version.resolution === "1080"
                          ? version.resolution + "p"
                          : version.resolution.toUpperCase()
                      }`}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        );
      return (
        <>
          <div
            onClick={() =>
              openInApp(onServer.versions[0].ratingKey, onServer.serverKey)
            }
            className={`${buttons.secondary} ${styles.actions__request__main_btn}`}
          >
            Watch now
          </div>
        </>
      );
    }

    if (pending)
      return (
        <>
          <button
            className={`${buttons.primary} ${styles.actions__request__main_btn}`}
          >
            Pending...
          </button>
          {counter}
        </>
      );

    if (userHasRequested) {
      return (
        <>
          <button
            className={`${buttons.primary__blue} ${styles.actions__request__main_btn}`}
          >
            Requested
          </button>
          {counter}
        </>
      );
    }

    return (
      <button
        className={`${buttons.primary} ${styles.actions__request__main_btn}`}
        onClick={request}
      >
        Request
      </button>
    );
  }

  return <>{requestButton()}</>;
}
