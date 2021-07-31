import React from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import Api from "../data/Api";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";

import { ReactComponent as PlayIcon } from "../assets/svg/play.svg";
import { ReactComponent as PauseIcon } from "../assets/svg/pause.svg";
import { ReactComponent as BufferIcon } from "../assets/svg/buffer.svg";

class MovieCard extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      onServer: false,
      imdbId: false,
      tmdbId: false,
    };
    this.getMovie = this.getMovie.bind(this);
  }

  componentDidMount() {
    this.getMovie();
  }

  // componentDidUpdate() {
  //   this.getMovie();
  // }

  getMovie() {
    let movie = this.props.movie;
    let id = movie.id;
    if (!this.props.api.movie_lookup[id]) {
      // check for cached

      if (!id) return false;
      Api.movie(id, true);
    }
  }

  render() {
    let id = this.props.movie.id;
    let movie = this.props.api.movie_lookup[id];
    if (!id || id === "false") {
      return null;
    }
    if (!movie) {
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
    let img = movie.poster_path ? (
      <LazyLoadImage
        alt={movie.title}
        src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
        // effect="blur"
      />
    ) : (
      <LazyLoadImage
        src={`${window.location.pathname.replace(
          /\/$/,
          ""
        )}/images/no-poster.jpg`}
        alt={movie.title}
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
          "card type--movie-tv " + (movie.on_server ? "on-server" : "")
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
            <p className="title" title={movie.title}>
              {movie.title}
              <span className="year">
                {this.props.character
                  ? this.props.character
                  : movie.release_date
                  ? "(" + new Date(movie.release_date).getFullYear() + ")"
                  : null}
              </span>
            </p>
          </div>
        </div>
      </div>
    );
  }
}

MovieCard = withRouter(MovieCard);

function MovieCardContainer(props) {
  return (
    <MovieCard
      api={props.api}
      movie={props.movie}
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

export default connect(mapStateToProps)(MovieCardContainer);
