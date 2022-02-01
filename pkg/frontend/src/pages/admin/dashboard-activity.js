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
      }, 5000);
    }

    return () => {
      clearInterval(interval);
      clearInterval(intervalSessions);
    };
  }, [liveUpdate]);

  function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return "0 bps";

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["bps", "Kbps", "Mbps", "Gbps", "TB", "PB", "EB", "ZB", "YB"];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  }

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

          if (!selectedMedia.Part) {
            return null;
          }

          if (!selectedMedia.Part[0].Stream) {
            return null;
          }

          const bitrate = formatBytes(session.Session.bandwidth * 1000, 0);

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
                bitrate={bitrate}
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
