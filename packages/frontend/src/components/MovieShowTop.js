import React from "react";
import { ReactComponent as RequestIcon } from "../assets/svg/request.svg";
import { ReactComponent as ReportIcon } from "../assets/svg/report.svg";
import { ReactComponent as CheckIcon } from "../assets/svg/check.svg";
import { ReactComponent as Spinner } from "../assets/svg/spinner.svg";
import { ReactComponent as CloseIcon } from "../assets/svg/close.svg";
import { LazyLoadImage } from "react-lazy-load-image-component";
import ReactPlayer from "react-player/youtube";

class MovieShowTop extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      width: 0,
    };

    this.resize = this.resize.bind(this);
  }
  componentDidMount() {
    window.addEventListener("resize", this.resize.bind(this));
    this.resize();
  }

  resize() {
    let size = "/w300";
    let width = window.innerWidth;
    if (width > 300) {
      size = "/w780";
    }
    if (width > 780) {
      size = "/w1280";
    }
    // if (width > 1280) {
    //   size = "/original";
    // }
    this.setState({ bgSize: size });
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.resize.bind(this));
  }

  render() {
    let typeRequest = this.props.mediaData.episode_run_time
      ? this.props.season
        ? `season ${this.props.season}`
        : "show"
      : "";
    let requestBtn = this.props.requestPending ? (
      <button className="btn btn__square pending">
        <Spinner />
        Request {typeRequest}
      </button>
    ) : this.props.mediaData.on_server ? (
      <a
        href={`https://app.plex.tv/desktop#!/server/${this.props.mediaData.on_server.serverKey}/details?key=%2Flibrary%2Fmetadata%2F${this.props.mediaData.on_server.ratingKey}`}
        target="_blank"
        rel="noreferrer"
        className="btn btn__square good"
      >
        <CheckIcon />
        Watch now
      </a>
    ) : this.props.requested ? (
      <button className="btn btn__square blue" onClick={this.props.request}>
        {`Requested by ${this.props.requested}
				${this.props.requested > 1 ? "users" : "user"}`}
      </button>
    ) : (
      <button className="btn btn__square" onClick={this.props.request}>
        <RequestIcon />
        Request {typeRequest}
      </button>
    );

    let reportBtn = this.props.mediaData.on_server ? (
      <button className="btn btn__square" onClick={this.props.openIssues}>
        <ReportIcon />
        Report an issue
      </button>
    ) : null;

    let video = this.props.video;

    return (
      <div className={`media-top ${this.props.trailer ? "show-trailer" : ""}`}>
        <div
          className="media-backdrop"
          key={`${this.props.mediaData.title}__backdrop__${
            this.props.trailer ? "trailer" : "n_trailer"
          }`}
        >
          <div
            className="media-trailer--close"
            onClick={() => this.props.showTrailer()}
          >
            <CloseIcon />
          </div>
          {video && this.props.trailer ? (
            <div className="media-trailer">
              <ReactPlayer
                url={`https://www.youtube.com/watch?v=${video.key}`}
                playing={true}
                width="100%"
                height="100%"
                playsinline={true}
                onEnded={() => this.props.showTrailer()}
                onPause={() => this.props.showTrailer()}
                onError={(error) => console.log(error)}
              />
            </div>
          ) : null}
          {this.props.mediaData.backdrop_path ? (
            <LazyLoadImage
              src={`https://image.tmdb.org/t/p${this.state.bgSize}${this.props.mediaData.backdrop_path}
              `}
              alt={this.props.mediaData.title}
              effect="blur"
              key={`${this.props.mediaData.title}__backdrop`}
            />
          ) : (
            <div className="no-backdrop"></div>
          )}
        </div>
        <div className="media-poster">
          <div className="media-poster__cap">
            <div className="media-poster--inner">
              {this.props.mediaData.poster_path ? (
                <LazyLoadImage
                  src={
                    "https://image.tmdb.org/t/p/w500" +
                    this.props.mediaData.poster_path
                  }
                  alt={this.props.mediaData.title}
                  effect="blur"
                  key={`${this.props.mediaData.title}__poster`}
                />
              ) : (
                <LazyLoadImage
                  src={"/images/no-poster.jpg"}
                  alt={this.props.mediaData.title}
                  effect="blur"
                  key={`${this.props.mediaData.title}__nposter`}
                />
              )}
            </div>
          </div>
        </div>
        <div className="media-details">
          <span></span>
          <div className="media-details--top">
            {this.props.mediaData.logo ? (
              <LazyLoadImage
                className="media-logo"
                src={this.props.mediaData.logo}
              />
            ) : (
              <h1 className="single-title">
                {this.props.mediaData.title
                  ? this.props.mediaData.title
                  : this.props.mediaData.name}
              </h1>
            )}
          </div>
          <div className="media--actions">
            {requestBtn}
            {reportBtn}
          </div>
        </div>
      </div>
    );
  }
}

export default MovieShowTop;
