import React from "react";
import { ReactComponent as RequestIcon } from "../../assets/svg/request.svg";
import { ReactComponent as ReportIcon } from "../../assets/svg/report.svg";
import { ReactComponent as WatchIcon } from "../../assets/svg/play.svg";
import { ReactComponent as CheckIcon } from "../../assets/svg/check.svg";
import { LazyLoadImage } from "react-lazy-load-image-component";

class ShowTop extends React.Component {
  render() {
    let watchBtn = this.props.seriesData.onServer ? (
      <button className="btn btn__square good">
        <WatchIcon />
        Play
      </button>
    ) : null;

    let requestBtn = this.props.seriesData.on_server ? (
      <div className="btn btn__square good">
        <CheckIcon />
        On Plex
      </div>
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

    let video = this.props.seriesData.videos.results
      ? this.props.seriesData.videos.results[0]
      : false;

    if (video) {
      if (video.site !== "YouTube") {
        video = false;
      }
    }

    return (
      <div className={`series-top ${this.props.trailer ? "show-trailer" : ""}`}>
        <div className="series-backdrop" key={`${this.props.seriesData.title}__backdrop`}>
          {video && this.props.trailer ? (
            <div className="series-trailer">
              <iframe
                frameBorder="0"
                height="100%"
                width="100%"
                src={`https://youtube.com/embed/${video.key}?autoplay=1&controls=0&showinfo=0&autohide=1&loop=1&modestbranding=1&playsinline=1&rel=0`}
              ></iframe>
            </div>
          ) : null}
          {this.props.seriesData.backdrop_path ? (
            <LazyLoadImage
              src={"https://image.tmdb.org/t/p/w1280/" + this.props.seriesData.backdrop_path}
              alt={this.props.seriesData.title}
              effect="blur"
              key={`${this.props.seriesData.title}__backdrop`}
            />
          ) : (
            <div
              className="no-backdrop"
              style={{
                backgroundImage: "url(/p-seamless.png)",
              }}
            ></div>
          )}
        </div>
        <div className="series-poster">
          <div className="series-poster--inner">
            {this.props.seriesData.poster_path ? (
              <LazyLoadImage
                src={"https://image.tmdb.org/t/p/w500/" + this.props.seriesData.poster_path}
                alt={this.props.seriesData.title}
                effect="blur"
                key={`${this.props.seriesData.title}__poster`}
              />
            ) : null}
          </div>
        </div>
        <div className="series-details">
          <span></span>
          <div className="series-details--top">
            {this.props.seriesData.logo ? (
              <LazyLoadImage className="series-logo" src={this.props.seriesData.logo} />
            ) : (
              <h1 className="single-title">{this.props.seriesData.title}</h1>
            )}
          </div>
          <div className="series--actions">
            {watchBtn}
            {requestBtn}
            {reportBtn}
          </div>
        </div>
      </div>
    );
  }
}

export default ShowTop;
