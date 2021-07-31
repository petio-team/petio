import React from "react";
import { withRouter, Link } from "react-router-dom";
import { connect } from "react-redux";
import PersonCard from "../components/PersonCard";
import TvCard from "../components/TvCard";
import Api from "../data/Api";
import Nav from "../data/Nav";
import Carousel from "../components/Carousel";
import "react-lazy-load-image-component/src/effects/blur.css";
import User from "../data/User";
import Review from "../components/Review";
import ReviewsList from "../components/ReviewsLists";
import MovieShowLoading from "../components/MovieShowLoading";
import MovieShowTop from "../components/MovieShowTop";
import MovieShowOverview from "../components/MovieShowOverview";

class Series extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      onServer: false,
      id: this.props.match.params.id,
      requested: false,
      related: false,
      trailer: false,
      reviewOpen: false,
      pathname: this.props.location.pathname,
    };

    this.getSeries = this.getSeries.bind(this);
    this.request = this.request.bind(this);
    this.getRequests = this.getRequests.bind(this);
    this.init = this.init.bind(this);
    this.showTrailer = this.showTrailer.bind(this);
    this.openReview = this.openReview.bind(this);
    this.closeReview = this.closeReview.bind(this);
    this.getReviews = this.getReviews.bind(this);
    this.storePos = this.storePos.bind(this);
  }

  componentWillUnmount() {
    this.storePos();
  }

  componentDidUpdate() {
    this.getRequests();
    if (this.props.match.params.id !== this.state.id) {
      this.storePos();
      this.setState({
        onServer: false,
        id: this.props.match.params.id,
        requested: false,
        related: false,
        pathname: this.props.location.pathname,
      });
      this.init();
    }
  }

  storePos() {
    let page = document.querySelectorAll(".page-wrap")[0];
    let carouselsData = document.querySelectorAll(".carousel");
    let carousels = [];
    carouselsData.forEach((carousel) => {
      carousels.push(carousel.scrollLeft);
    });
    Nav.storeNav(this.state.pathname, false, page.scrollTop, carousels);
  }

  init() {
    let id = this.props.match.params.id;
    this.getSeries(id);
    this.getRequests();
    this.getReviews();
    let page = document.querySelectorAll(".page-wrap")[0];
    let scrollY = 0;
    let pHist = Nav.getNav(this.props.location.pathname);
    if (pHist) {
      scrollY = pHist.scroll;
      document.querySelectorAll(".carousel").forEach((carousel, i) => {
        carousel.scrollLeft = pHist.carousels[i];
      });
    }

    page.scrollTop = scrollY;
  }

  componentDidMount() {
    this.init();
  }

  getRequests() {
    let id = this.props.match.params.id;
    let requests = this.props.user.requests;
    if (!requests) return;
    if (!requests[id]) {
      if (this.state.requested) {
        this.setState({
          requested: false,
        });
      }
      return;
    }
    let requestUsers = Object.keys(requests[id].users).length;
    if (
      this.props.api.series_lookup[id] &&
      this.props.user.requests[id] &&
      requestUsers !== this.state.requested &&
      this.props.user.requests[id].seasons &&
      this.props.api.series_lookup[id].seasons
    ) {
      if (
        !this.props.user.requests[id].seasons ||
        Object.keys(this.props.user.requests[id].seasons).length ===
          Object.keys(this.props.api.series_lookup[id].seasons).length
      )
        this.setState({
          requested: requestUsers,
        });
    } else if (!requests[id] && this.state.requested) {
      this.setState({
        requested: false,
      });
    }
  }

  async request() {
    let id = this.props.match.params.id;
    let series = this.props.api.series_lookup[id];
    let requests = this.props.user.requests[id];
    if (requests) {
      if (
        (requests.users.includes(this.props.user.current.id) &&
          !this.props.user.requests[id].seasons) ||
        Object.keys(this.props.user.requests[id].seasons).length ===
          Object.keys(this.props.api.series_lookup[id].seasons).length
      ) {
        this.props.msg({
          message: "Already Requested",
          type: "error",
        });
        return;
      }
    }
    let seasons = {};
    if (series.seasons.length > 0)
      series.seasons.map((season) => {
        seasons[season.season_number] = true;
      });
    let request = {
      id: series.id,
      tmdb_id: series.id,
      tvdb_id: series.tvdb_id,
      imdb_id: series.imdb_id,
      title: series.name,
      type: "tv",
      thumb: series.poster_path,
      seasons: seasons,
    };

    try {
      await User.request(request, this.props.user.current);
      this.props.msg({
        message: `New Request added: ${series.name}`,
        type: "good",
      });
      await User.getRequests();
      this.getRequests();
    } catch (err) {
      this.props.msg({
        message: err,
        type: "error",
      });
    }
  }

  getReviews() {
    let id = this.props.match.params.id;
    User.getReviews(id);
  }

  getSeries() {
    let id = this.props.match.params.id;

    if (!this.props.api.series_lookup[id]) {
      // check for cached
      Api.series(id);
    } else if (this.props.api.series_lookup[id].isMinified) {
      Api.series(id);
    }
  }

  timeConvert(n) {
    var num = n;
    var hours = num / 60;
    var rhours = Math.floor(hours);
    var minutes = (hours - rhours) * 60;
    var rminutes = Math.round(minutes);
    var hrs = rhours < 1 ? "" : rhours === 1 ? "hr" : rhours > 1 ? "hrs" : "";
    return `${rhours >= 1 ? rhours : ""} ${hrs} ${rminutes} mins`;
  }

  findNested(obj, key, value) {
    // Base case
    if (obj[key] === value) {
      return obj;
    } else {
      for (var i = 0, len = Object.keys(obj).length; i < len; i++) {
        if (typeof obj[i] == "object") {
          var found = this.findNested(obj[i], key, value);
          if (found) {
            // If the object was found in the recursive call, bubble it up.
            return found;
          }
        }
      }
    }
  }

  openReview() {
    this.setState({
      reviewOpen: true,
    });
  }

  closeReview() {
    this.setState({
      reviewOpen: false,
    });
  }

  showTrailer() {
    this.setState({
      trailer: this.state.trailer ? false : true,
    });
  }

  seasonEpisodes(seriesData, seasonNumber) {
    let onServer =
      seriesData &&
      seriesData.server_seasons &&
      seriesData.server_seasons[seasonNumber]
        ? seriesData.server_seasons[seasonNumber]
        : false;
    return {
      onServer: onServer ? true : false,
      seasonNumber: seasonNumber,
      availableEps: onServer ? Object.keys(onServer.episodes).length : 0,
      totalEps:
        seriesData &&
        seriesData.seasonData &&
        seriesData.seasonData[seasonNumber]
          ? Object.keys(seriesData.seasonData[seasonNumber].episodes).length
          : 0,
    };
  }

  render() {
    let id = this.state.id;
    let seriesData = this.props.api.series_lookup[id];

    if (!seriesData) {
      return <MovieShowLoading />;
    }

    if (seriesData.isMinified) {
      return <MovieShowLoading />;
    }

    if (seriesData.error) {
      return (
        <div className="media-wrap">
          <p className="main-title">Series Not Found</p>
          <p>
            This show may have been removed from TMDb or the link you&apos;ve
            followed is invalid
          </p>
        </div>
      );
    }

    let related = null;
    let relatedItems = null;
    if (seriesData.recommendations) {
      relatedItems = seriesData.recommendations.map((key) => {
        return (
          <TvCard
            key={`related-${key}`}
            msg={this.props.msg}
            series={{ id: key }}
          />
        );
      });
      related = (
        <section>
          <h3 className="sub-title mb--1">Related Shows</h3>
          <Carousel>{relatedItems}</Carousel>
        </section>
      );
    }

    if (this.props.user.reviews) {
      if (this.props.user.reviews[this.props.match.params.id]) {
        for (
          var i = 0;
          i < this.props.user.reviews[this.props.match.params.id].length;
          i++
        ) {
          if (
            this.props.user.reviews[this.props.match.params.id][i].user ==
            this.props.user.current._id
          ) {
            break;
          }
        }
      }
    }

    let seasons = seriesData.seasons;

    let video = false;
    if (seriesData.videos.results) {
      for (let i = 0; i < seriesData.videos.results.length; i++) {
        let vid = seriesData.videos.results[i];
        if (vid.site === "YouTube" && !video) {
          video = vid;
        }
      }
    }

    return (
      <div
        className="media-wrap"
        data-id={seriesData.imdb_id}
        key={`${seriesData.title}__wrap`}
      >
        <Review
          id={this.props.match.params.id}
          msg={this.props.msg}
          user={this.props.user.current}
          active={this.state.reviewOpen}
          closeReview={this.closeReview}
          getReviews={this.getReviews}
          item={seriesData}
        />
        <MovieShowTop
          mediaData={seriesData}
          video={video}
          trailer={this.state.trailer}
          requested={this.state.requested}
          request={this.request}
          openIssues={this.props.openIssues}
          showTrailer={this.showTrailer}
        />

        <div className="media-content">
          <MovieShowOverview
            mediaData={seriesData}
            video={video}
            user={this.props.user}
            showTrailer={this.showTrailer}
            match={this.props.match}
            openReview={this.openReview}
            requested={this.state.requested}
            request={this.request}
            externalReviews={seriesData.reviews}
            openIssues={this.props.openIssues}
            trailer={this.state.trailer}
          />

          <section>
            <h3 className="sub-title mb--1">Seasons</h3>
            <Carousel>
              {seasons.map((season) => {
                let seasonInfo = this.seasonEpisodes(
                  seriesData,
                  season.season_number
                );
                let requestedSeason =
                  this.props.user.requests[id] &&
                  this.props.user.requests[id].seasons &&
                  this.props.user.requests[id].seasons[season.season_number]
                    ? true
                    : false;
                return (
                  <div
                    className={`card type--movie-tv img-loaded ${
                      seasonInfo.onServer ? "on-server" : ""
                    } ${requestedSeason ? "requested" : ""}`}
                    data-season_no={season.season_number}
                    data-total_eps={seasonInfo.totalEps}
                    data-avail_eps={seasonInfo.availableEps}
                    key={`season--${season.season_number}${id}`}
                  >
                    <div className="card--inner">
                      <Link
                        to={`/series/${id}/season/${season.season_number}`}
                        className="full-link"
                      ></Link>
                      <div className="image-wrap">
                        {season.poster_path ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w200${season.poster_path}`}
                            alt={season.name}
                          />
                        ) : seriesData.poster_path ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w500${seriesData.poster_path}`}
                            alt={season.name}
                          />
                        ) : null}
                        <div className="ep-count">
                          {seasonInfo.availableEps} / {seasonInfo.totalEps}
                        </div>
                      </div>
                      <div className="text-wrap">
                        <p className="title">
                          {season.name}
                          <span className="year">
                            {season.air_date
                              ? "(" +
                                new Date(season.air_date).getFullYear() +
                                ")"
                              : ""}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </Carousel>
          </section>
          <section>
            <h3 className="sub-title mb--1">Cast</h3>
            <Carousel>
              {seriesData.credits.cast.map((cast) => {
                return (
                  <PersonCard
                    key={`${cast.name}--${cast.character}`}
                    person={cast}
                    character={cast.character}
                  />
                );
              })}
            </Carousel>
          </section>
          {related}

          <section>
            <h3 className="sub-title mb--1">Reviews</h3>
            {this.props.user.reviews ? (
              <ReviewsList
                reviews={this.props.user.reviews[id]}
                external={seriesData.reviews}
              />
            ) : null}
          </section>
        </div>
      </div>
    );
  }
}

Series = withRouter(Series);

function SeriesContainer(props) {
  return (
    <Series
      api={props.api}
      user={props.user}
      msg={props.msg}
      openIssues={props.openIssues}
    />
  );
}

const mapStateToProps = function (state) {
  return {
    api: state.api,
    user: state.user,
  };
};

export default connect(mapStateToProps)(SeriesContainer);
