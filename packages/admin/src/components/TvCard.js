import React from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import Api from "../data/Api";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import { ReactComponent as PlayIcon } from "../assets/svg/play.svg";
import { ReactComponent as PauseIcon } from "../assets/svg/pause.svg";
import { ReactComponent as BufferIcon } from "../assets/svg/buffer.svg";

class TvCard extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      onServer: false,
      imdbId: false,
      tmdbId: false,
    };
    this.getMovie = this.getSeries.bind(this);
  }

  componentDidMount() {
    this.getSeries();
  }

  getSeries() {
    let series = this.props.series;
    let id = series.id;
    if (!this.props.api.series_lookup[id]) {
      // check for cached

      if (!id) return false;
      Api.series(id, true);
    }
  }

  render() {
    let id = this.props.series.id;
    if (!id || id === "false") {
      return null;
    }
    let series = this.props.api.series_lookup[id];
    if (!series) {
      return (
        <div
          key={this.props.key}
          data-key={this.props.key}
          className={"card type--movie-tv "}
        >
          <div className="card--inner">
            <div className="image-wrap">
              <div className="no-poster"></div>
            </div>
            <div className="text-wrap">
              <p className="title">
                Loading...
                <span className="year"></span>
              </p>
            </div>
          </div>
        </div>
      );
    }
    let img = series.poster_path ? (
      <LazyLoadImage
        alt={series.title}
        src={`https://image.tmdb.org/t/p/w200${series.poster_path}`}
        // effect="blur"
      />
    ) : (
      <LazyLoadImage
        src={`${window.location.pathname.replace(
          /\/$/,
          ""
        )}/images/no-poster.jpg`}
        alt={series.title}
      />
    );
    let playbackState = null;
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
    return (
      <div
        key={this.props.key}
        data-key={this.props.key}
        className={
          "card type--movie-tv " + (series.on_server ? "on-server" : "")
        }
      >
        <div className="card--inner">
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
            {img}
            <div className="playback-status">{playbackState}</div>
          </div>
          <div className="text-wrap">
            <p className="title">
              {series.name}
              <span className="year">
                {this.props.character
                  ? this.props.character
                  : "(" + new Date(series.first_air_date).getFullYear() + ")"}
              </span>
            </p>
          </div>
        </div>
      </div>
    );
  }
}

TvCard = withRouter(TvCard);

function TvCardContainer(props) {
  return (
    <TvCard
      api={props.api}
      series={props.series}
      character={props.character}
      progress={props.progress}
      playbackState={props.playbackState}
    />
  );
}

const mapStateToProps = function (state) {
  return {
    api: state.api,
  };
};

export default connect(mapStateToProps)(TvCardContainer);
