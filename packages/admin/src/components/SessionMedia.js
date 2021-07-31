import React from "react";
import Api from "../data/Api";
import MovieCard from "./MovieCard";
import TvCard from "./TvCard";
import { ReactComponent as PlayIcon } from "../assets/svg/play.svg";
import { ReactComponent as PauseIcon } from "../assets/svg/pause.svg";
import { ReactComponent as BufferIcon } from "../assets/svg/buffer.svg";

class SessionMedia extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      id: false,
    };
  }

  componentDidMount() {
    if (!this.props.live && this.props.type !== "clip") {
      if (this.props.type === "movie") {
        this.getMovie();
      } else {
        this.getSeries();
      }
    }
  }

  componentDidUpdate() {
    // if (!this.props.live && !this.state.id && this.props.type !== "clip") {
    //   if (this.props.type === "movie") {
    //     this.getMovie();
    //   } else {
    //     this.getSeries();
    //   }
    // }
  }

  getMovie() {
    Api.get_plex_media(this.props.id, "movie").then((res) => {
      this.setState({
        id: res.tmdb_id,
      });
    });
  }

  getSeries() {
    Api.get_plex_media(this.props.id, "tv").then((res) => {
      this.setState({
        id: res.tmdb_id,
      });
    });
  }

  render() {
    let card = null;
    if (!this.state.id && !this.props.live && this.props.type !== "clip") {
      return null;
    }
    if (
      this.props.live ||
      this.props.type === "clip" ||
      this.props.type === "trailer" ||
      this.state.id === "false"
    ) {
      let playbackState;
      switch (this.props.playbackState) {
        case "playing":
        case "streaming":
          playbackState = <PlayIcon />;
          break;
        case "paused":
          playbackState = <PauseIcon />;
          break;
        case "buffering":
          playbackState = <BufferIcon />;
          break;
        default:
          playbackState = <p>{this.props.playbackState}</p>;
          break;
      }
      card = (
        <div className="card type--generic" key={this.props.uid}>
          <div className="card--inner"></div>
          <div className="image-wrap">
            {this.props.progress ? (
              <div className="session--duration">
                <div
                  className="session--prog"
                  style={{
                    maxWidth: this.props.progress + "%",
                  }}
                ></div>
              </div>
            ) : null}
            <div className="playback-status">{playbackState}</div>
          </div>
        </div>
      );
    } else if (this.props.type === "movie") {
      card = (
        <MovieCard
          key={this.props.uid}
          movie={{
            id: this.state.id,
          }}
          progress={this.props.progress}
          playbackState={this.props.playbackState}
        />
      );
    } else {
      card = (
        <TvCard
          key={this.props.uid}
          series={{
            id: this.state.id,
          }}
          progress={this.props.progress}
          playbackState={this.props.playbackState}
        />
      );
    }
    return (
      <div className="session--media">
        <div className="session--media--inner">
          <div className="session--user">
            <img src={this.props.userThumb} />
          </div>
          {card}
        </div>
      </div>
    );
  }
}

export default SessionMedia;
