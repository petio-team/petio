import React from "react";
import { withRouter, Link } from "react-router-dom";
import { connect } from "react-redux";
import Api from "../data/Api";
import User from "../data/User";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";

import { ReactComponent as RequestIcon } from "../assets/svg/request.svg";

class TvCard extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      onServer: false,
      imdbId: false,
      tmdbId: false,
      inView: false,
      imgLoaded: false,
    };
    this.getMovie = this.getSeries.bind(this);
    this.card = React.createRef();
    this.inView = this.inView.bind(this);
    this.request = this.request.bind(this);
    this.imgLoaded = this.imgLoaded.bind(this);
  }

  componentDidMount() {
    // this.getSeries();
    this.inView();
  }

  componentDidUpdate() {
    if (!this.state.inView) {
      this.inView();
    }
  }

  async request() {
    let id = this.props.series.id;
    let series = this.props.api.series_lookup[id];

    let request = {
      id: series.id,
      tmdb_id: series.id,
      tvdb_id: series.tvdb_id,
      imdb_id: series.imdb_id,
      title: series.name,
      type: "tv",
      thumb: series.poster_path,
    };

    try {
      await User.request(request, this.props.user.current);
      this.props.msg({
        message: `New Request added: ${series.name}`,
        type: "good",
      });
      await User.getRequests();
    } catch (err) {
      this.props.msg({
        message: err,
        type: "error",
      });
    }
  }

  inView() {
    if (!this.card.current) return;
    const left = this.card.current.getBoundingClientRect().left;
    if (left <= this.props.width * 2 || this.props.view) {
      this.setState({
        inView: true,
      });
      this.getSeries();
    }
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

  imgLoaded() {
    this.setState({
      imgLoaded: true,
    });
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
          ref={this.card}
          key={id}
          data-key={id}
          className={"card type--movie-tv "}
        >
          <div className="card--inner">
            <Link to={`/series/${id}`} className="full-link"></Link>
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
        onLoad={this.imgLoaded}
      />
    ) : (
      <LazyLoadImage
        src={`${window.location.pathname.replace(
          /\/$/,
          ""
        )}/images/no-poster.jpg`}
        alt={series.title}
        onLoad={this.imgLoaded}
      />
    );
    return (
      <div
        ref={this.card}
        key={series.id}
        data-key={series.id}
        className={`card type--movie-tv ${
          series.on_server ? "on-server" : ""
        } ${this.props.user.requests[series.id] ? "requested" : ""} ${
          this.state.imgLoaded ? "img-loaded" : "img-not-loaded"
        }`}
      >
        <div className="card--inner">
          <Link to={`/series/${series.id}`} className="full-link"></Link>
          {!this.props.user.requests[series.id] && !series.on_server ? (
            <div
              className="quick-req"
              title="Request now"
              onClick={this.request}
            >
              <RequestIcon />
            </div>
          ) : null}
          <div className="image-wrap">
            {this.props.popular_count ? (
              <p className="popular-card--count">{this.props.popular_count}</p>
            ) : null}
            {img}
          </div>
          <div className="text-wrap">
            <p className="title">
              {series.name}
              <span className="year">
                {this.props.character
                  ? this.props.character
                  : series.first_air_date
                  ? "(" + new Date(series.first_air_date).getFullYear() + ")"
                  : null}
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
      user={props.user}
      api={props.api}
      series={props.series}
      character={props.character}
      pos={props.pos}
      width={props.width}
      popular_count={props.popular_count}
      view={props.view}
      msg={props.msg}
    />
  );
}

const mapStateToProps = function (state) {
  return {
    api: state.api,
    user: state.user,
  };
};

export default connect(mapStateToProps)(TvCardContainer);
