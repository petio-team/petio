import { connect } from "react-redux";
import styles from "../../styles/views/admin.module.scss";
import { getSessions } from "../../services/plex.service";
import { useEffect, useState } from "react";
import ActivitySession from "./activitySession";
import typo from "../../styles/components/typography.module.scss";

const mapStateToProps = (state) => {
  return {
    system: state.system,
  };
};

function Activity({ system }) {
  const [liveUpdate, setLiveUpdate] = useState(true);
  useEffect(() => {
    async function updateSessions() {
      if (!liveUpdate) return;
      try {
        await getSessions();
      } catch (e) {
        console.log(e);
        setLiveUpdate(false);
      }
    }

    let interval = false;
    let intervalSessions = false;

    if (liveUpdate) {
      updateSessions();

      intervalSessions = setInterval(() => {
        updateSessions();
      }, 30000);
    }

    return () => {
      clearInterval(interval);
      clearInterval(intervalSessions);
    };
  }, [liveUpdate]);

  return (
    <div className={styles.dashboard__activity__wrap}>
      {system.sessions && system.sessions.length > 0 ? (
        system.sessions.map((session) => {
          let media = null;
          let selectedMedia = false;
          let type = false;
          for (let item of session.Media) {
            if (item.selected) {
              selectedMedia = item;
            }
          }

          let playback = selectedMedia.Part
            ? selectedMedia.Part[0].decision
            : "unknown";
          switch (session.type) {
            case "episode":
              media = session.grandparentRatingKey;
              type = "tv";
              break;
            case "movie":
              media = session.ratingKey;
              type = "movie";
              break;
            default:
              media = null;
              if (!media) return null;
          }
          return (
            <div
              key={`activity_sesion_${session.ratingKey}`}
              className={styles.dashboard__activity__item}
            >
              <ActivitySession
                ratingKey={media}
                type={type}
                session={session}
                progress={
                  session.Media &&
                  session.Media.length > 0 &&
                  session.viewOffset &&
                  session.viewOffset
                    ? (session.viewOffset / session.Media[0].duration) * 100
                    : 0
                }
                selectedMedia={selectedMedia}
                playback={playback}
              />
            </div>
          );
        })
      ) : (
        <div className={styles.dashboard__activity__empty}>
          <div className={styles.dashboard__module}>
            <p className={`${typo.body} ${typo.medium}`}>
              Nothing is currently being played.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default connect(mapStateToProps)(Activity);
