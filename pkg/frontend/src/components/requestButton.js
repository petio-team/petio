import { useEffect, useState } from "react";
import { addNewRequest } from "../services/user.service";
import buttons from "../styles/components/button.module.scss";
import styles from "../styles/views/movie.module.scss";

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
      await addNewRequest(request, currentUser);
      newNotification({
        type: "success",
        message: `New Request added: ${data.title || data.name}`,
        id: notify,
      });
    } catch (err) {
      console.log(err);
      newNotification({
        type: "success",
        message: `Request Failed: ${data.title || data.name}`,
        id: notify,
      });
    }
    setPending(false);
    updateRequests();
  }

  function requestButton() {
    let counter = null;
    if (requestCount > 0)
      counter = <div className={`${buttons.counter}`}>{requestCount}</div>;
    if (data.on_server)
      return (
        <>
          <button
            className={`${buttons.secondary} ${styles.actions__request__main_btn}`}
          >
            Watch now
          </button>
          {counter}
        </>
      );

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
