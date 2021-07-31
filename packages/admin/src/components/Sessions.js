import React from "react";
import SessionMedia from "./SessionMedia";
import { ReactComponent as ArrowIcon } from "../assets/svg/arrow-left.svg";
import { ReactComponent as LockIcon } from "../assets/svg/lock.svg";
import { ReactComponent as UnlockIcon } from "../assets/svg/unlock.svg";
import { ReactComponent as DirectIcon } from "../assets/svg/direct.svg";
import { ReactComponent as StreamIcon } from "../assets/svg/stream.svg";
import { ReactComponent as TranscodeIcon } from "../assets/svg/transcode.svg";

class Sessions extends React.Component {
  formatAudio(channels) {
    switch (channels) {
      case "1":
        return "(Mono)";

      case "2":
        return "(Stereo)";

      case "6":
        return "(5.1)";

      case "7":
        return "(6.1)";

      case "8":
        return "(7.1)";

      default:
        return `(${channels})`;
    }
  }

  formatDecision(dec) {
    switch (dec) {
      case "copy":
        return "Direct Stream";

      case "transcode":
        return "Transcode";

      default:
        return "Direct Play";
    }
  }

  decisionIcon(dec) {
    switch (dec) {
      case "copy":
        return (
          <span className="session--decision-icon stream">
            <StreamIcon />
          </span>
        );

      case "transcode":
        return (
          <span className="session--decision-icon transcode">
            <TranscodeIcon />
          </span>
        );

      default:
        return (
          <span className="session--decision-icon">
            <DirectIcon />
          </span>
        );
    }
  }

  playbackDetails(selectedMedia, type, session) {
    if (!selectedMedia.Part) {
      return null;
    }

    if (!selectedMedia.Part[0].Stream) {
      return null;
    }

    let bitrate;
    bitrate = selectedMedia.Part[0].Stream[0].bitrate;
    if (bitrate > 1000) {
      bitrate = Math.ceil(bitrate / 1000) + " mbps";
    } else {
      bitrate += " kbps";
    }

    return (
      <>
        <div className="session--playback--video">
          <p>
            <strong>Video</strong>
          </p>
          <p>
            {this.decisionIcon(selectedMedia.Part[0].Stream[0].decision)}
            {this.formatDecision(selectedMedia.Part[0].Stream[0].decision)}
          </p>
          {selectedMedia.Part[0].Stream[0].decision === "transcode" ||
          selectedMedia.Part[0].Stream[0].decision === "copy" ? (
            <>
              <p className="session--container">
                <span className="session--label">Container:</span>
                <span className="upper">{selectedMedia.container}</span>
                <ArrowIcon />
                <span className="upper">{selectedMedia.Part[0].container}</span>
              </p>
              <p>
                <span className="session--label">Quality:</span>
                <span>{selectedMedia.Part[0].Stream[0].displayTitle}</span>
                <ArrowIcon />
                <span>
                  {selectedMedia.videoResolution} ({bitrate})
                </span>
              </p>
            </>
          ) : (
            <>
              <p className="session--container">
                <span className="session--label">Container:</span>
                <span className="upper">{selectedMedia.Part[0].container}</span>
              </p>
              <p>
                <span className="session--label">Quality:</span>
                <span>
                  {selectedMedia.Part[0].Stream[0].displayTitle} ({bitrate})
                </span>
              </p>
            </>
          )}
        </div>
        <div className="session--playback--audio">
          <p>
            <strong>Audio</strong>
          </p>
          {selectedMedia.Part[0].Stream[1].decision === "transcode" ? (
            <p>
              {this.decisionIcon(selectedMedia.Part[0].Stream[1].decision)}
              {this.formatDecision(
                selectedMedia.Part[0].Stream[1].decision
              )}{" "}
              {selectedMedia.Part[0].Stream[1].displayTitle}
              <ArrowIcon />
              <span className="upper">
                {selectedMedia.Part[0].Stream[1].codec}
                &nbsp;
              </span>
              {this.formatAudio(selectedMedia.Part[0].Stream[1].channels)}
            </p>
          ) : (
            <p>
              {this.decisionIcon(selectedMedia.Part[0].Stream[1].decision)}
              {this.formatDecision(
                selectedMedia.Part[0].Stream[1].decision
              )}{" "}
              {selectedMedia.Part[0].Stream[1].displayTitle}
            </p>
          )}
          {selectedMedia.Part[0].Stream[2] ? (
            <>
              <p>
                <strong>Subtitles</strong>
              </p>
              <p>
                {this.decisionIcon(selectedMedia.Part[0].Stream[2].decision)}
                {selectedMedia.Part[0].Stream[2].displayTitle}
              </p>
            </>
          ) : null}
        </div>
        <div className="session--playback--player">
          <p>
            <strong>Player</strong>
          </p>
          <p>{session.Player.title + " (" + session.Player.product + ")"}</p>
          <p>
            {session.Player.local ? "Local" : "Remote"} {session.Player.address}{" "}
            <span className={"session--secure secure-" + session.Player.secure}>
              {session.Player.secure ? <LockIcon /> : <UnlockIcon />}
            </span>
          </p>
        </div>
      </>
    );
  }

  render() {
    if (this.props.sessions) {
      let sessions = this.props.sessions;
      if (sessions.length === 0) {
        return <p>No active sessions</p>;
      } else {
        return (
          <div className="sessions">
            {sessions.map((session) => {
              let media = null;
              let selectedMedia = false;
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
                  break;
                case "movie":
                  media = session.ratingKey;
                  break;
                default:
                  return null;
              }
              return (
                <div
                  className="session"
                  data-id={session.Session ? session.Session.id : "pending"}
                  key={
                    session.Player.machineIdentifier +
                    session.ratingKey +
                    "__session"
                  }
                >
                  <SessionMedia
                    id={media}
                    uid={session.Player.machineIdentifier + session.ratingKey}
                    type={session.type}
                    userThumb={session.User.thumb}
                    live={session.live ? true : false}
                    progress={
                      session.Media.length > 0 && session.viewOffset
                        ? (session.viewOffset / session.Media[0].duration) * 100
                        : 0
                    }
                    playbackState={session.Player.state}
                  />
                  <div className="session--info">
                    <p>User: {session.User.title}</p>
                    <p className="session--title">
                      {session.title + (session.live ? " (Live)" : "")}
                    </p>
                    {session.type === "episode" ? (
                      <p className="session--show">
                        {session.grandparentTitle +
                          (session.parentTitle
                            ? " | " + session.parentTitle
                            : "")}
                      </p>
                    ) : null}
                    <div className="session--playback">
                      <p className="session--title">Playback Info</p>
                      {this.playbackDetails(selectedMedia, playback, session)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        );
      }
    } else {
      return <p>No active sessions</p>;
    }
  }
}

export default Sessions;
