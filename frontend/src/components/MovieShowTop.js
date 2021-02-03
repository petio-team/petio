import React from "react";
import { ReactComponent as RequestIcon } from "../assets/svg/request.svg";
import { ReactComponent as ReportIcon } from "../assets/svg/report.svg";
import { ReactComponent as CheckIcon } from "../assets/svg/check.svg";
import { LazyLoadImage } from "react-lazy-load-image-component";

class MovieShowTop extends React.Component {
  render() {
    let requestBtn = this.props.mediaData.on_server ? (
      <a href={`https://app.plex.tv/desktop#!/${this.props.mediaData.on_server}`} target="_blank" className="btn btn__square good">
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
        Request
      </button>
    );

    let reportBtn = (
      <button className="btn btn__square" onClick={this.props.openIssues}>
        <ReportIcon />
        Report an issue
      </button>
    );

    let video = this.props.video;

    return (
      <div className={`media-top ${this.props.trailer ? "show-trailer" : ""}`}>
        <div className="media-backdrop" key={`${this.props.mediaData.title}__backdrop`}>
          {video && this.props.trailer ? (
            <div className="media-trailer">
              <iframe
                frameBorder="0"
                height="100%"
                width="100%"
                src={`https://youtube.com/embed/${video.key}?autoplay=1&controls=0&showinfo=0&autohide=1&loop=1&modestbranding=1&playsinline=1&rel=0`}
              ></iframe>
            </div>
          ) : null}
          {this.props.mediaData.backdrop_path ? (
            <LazyLoadImage
              src={"https://image.tmdb.org/t/p/w1280/" + this.props.mediaData.backdrop_path}
              alt={this.props.mediaData.title}
              effect="blur"
              key={`${this.props.mediaData.title}__backdrop`}
            />
          ) : (
            <div className="no-backdrop"></div>
          )}
        </div>
        <div className="media-poster">
          <div className="media-poster--inner">
            {this.props.mediaData.poster_path ? (
              <LazyLoadImage src={"https://image.tmdb.org/t/p/w500/" + this.props.mediaData.poster_path} alt={this.props.mediaData.title} effect="blur" key={`${this.props.mediaData.title}__poster`} />
            ) : null}
          </div>
        </div>
        <div className="media-details">
          <span></span>
          <div className="media-details--top">
            {this.props.mediaData.logo ? (
              <LazyLoadImage className="media-logo" src={this.props.mediaData.logo} />
            ) : (
              <h1 className="single-title">{this.props.mediaData.title ? this.props.mediaData.title : this.props.mediaData.name}</h1>
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
