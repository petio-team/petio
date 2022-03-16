import styles from "../styles/components/trailer.module.scss";
import ReactPlayer from "react-player/youtube";
import { useEffect, useRef, useState } from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/opacity.css";
import { ReactComponent as PlayIcon } from "../assets/svg/play.svg";
import { ReactComponent as PauseIcon } from "../assets/svg/pause.svg";
import { ReactComponent as CloseIcon } from "../assets/svg/close.svg";

export default function Trailer({ videoId, callback, newNotification }) {
  const [playing, setPlaying] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [seeking, setSeeking] = useState(false);
  const [progress, setProgress] = useState({
    playedSeconds: 0,
    played: 0,
    loadedSeconds: 0,
    loaded: 0,
  });
  const [showControls, setShowControls] = useState(false);

  const player = useRef();

  function handleProgress(e) {
    if (seeking) return;
    setProgress(e);
  }

  function handleSeekMouseDown(e) {
    setSeeking(true);
  }

  function handleSeekChange(e) {
    setProgress({
      ...progress,
      played: parseFloat(e.target.value),
    });
  }

  function handleSeekMouseUp(e) {
    setSeeking(false);
    player.current.seekTo(parseFloat(e.target.value));
  }

  useEffect(() => {
    if (!ReactPlayer.canPlay(`https://www.youtube.com/watch?v=${videoId}`)) {
      newNotification({
        message: "Unable to load video",
        type: "error",
      });
    }
    // eslint-disable-next-line
  }, [videoId]);

  return (
    <div className={styles.wrap}>
      <div
        className={styles.inner}
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      >
        <div
          className={`${styles.video} ${isPlaying ? styles.video__show : ""}`}
        >
          <ReactPlayer
            ref={player}
            className={styles.video__inner}
            url={`https://www.youtube.com/watch?v=${videoId}`}
            playing={playing}
            width="100%"
            height="100%"
            loop={true}
            // playsinline={true}
            controls={false}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onProgress={handleProgress}
            onError={(e) => {
              console.log("error playing");
              newNotification({
                message: "Unable to play video",
                type: "error",
              });
            }}
          />
        </div>
        <LazyLoadImage
          className={`${styles.poster} ${isPlaying ? styles.poster__hide : ""}`}
          src={`http://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
          alt="Video Poster"
          effect="opacity"
        />
        <div className={styles.close} onClick={callback}>
          <CloseIcon />
        </div>
        <div
          className={`${styles.controls} ${
            showControls ? styles.controls__show : ""
          }`}
        >
          <button
            className={styles.controls__playPause}
            onClick={() => setPlaying(!playing)}
          >
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>
          <div className={styles.controls__progress}>
            <div
              className={styles.controls__progress__buffer}
              style={{ width: progress.loaded * 100 + "%" }}
            ></div>
            <div
              className={styles.controls__progress__pos}
              style={{ width: progress.played * 100 + "%" }}
            ></div>
            <input
              className={styles.controls__progress__input}
              type="range"
              min={0}
              max={0.999999}
              step="any"
              value={progress.played}
              onMouseDown={handleSeekMouseDown}
              onChange={handleSeekChange}
              onMouseUp={handleSeekMouseUp}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
