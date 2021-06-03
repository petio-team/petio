import React from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import PersonCard from "../components/PersonCard";
import MovieCard from "../components/MovieCard";
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

class Movie extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      onServer: false,
      id: this.props.match.params.id,
      requested: false,
      related: false,
      trailer: false,
      reviewOpen: false,
      requestPending: false,
      pathname: this.props.location.pathname,
    };

    this.getMovie = this.getMovie.bind(this);
    this.request = this.request.bind(this);
    this.getRequests = this.getRequests.bind(this);
    this.init = this.init.bind(this);
    this.showTrailer = this.showTrailer.bind(this);
    this.openReview = this.openReview.bind(this);
    this.closeReview = this.closeReview.bind(this);
    this.getReviews = this.getReviews.bind(this);
    this.storePos = this.storePos.bind(this);
    this.getPos = this.getPos.bind(this);
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
        trailer: false,
      });
      this.init();
    }
    if (this.state.getPos) {
      this.setState({
        getPos: false,
      });
      this.getPos();
    }
  }

  storePos() {
    let page = document.querySelectorAll(".page-wrap")[0];
    let carouselsData = document.querySelectorAll(".carousel");
    let carousels = [];
    carouselsData.forEach((carousel) => {
      carousels.push(carousel.scrollLeft);
    });
    Nav.storeNav(`/movie/${this.state.id}`, false, page.scrollTop, carousels);
  }

  init() {
    let id = this.props.match.params.id;
    this.getMovie(id);
    this.getRequests();
    this.getReviews();
    let pHist = Nav.getNav(this.props.location.pathname);
    if (pHist) {
      this.setState({
        getPos: true,
      });
    }
    this.getPos();
  }

  getPos() {
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
    if (this.props.user.requests[id] && requestUsers !== this.state.requested) {
      this.setState({
        requested: requestUsers,
      });
    }
  }

  async request() {
    let id = this.props.match.params.id;
    let movie = this.props.api.movie_lookup[id];
    let requests = this.props.user.requests[id];
    if (requests) {
      if (requests.users.includes(this.props.user.current.id)) {
        this.props.msg({
          message: `Already Requested`,
          type: "error",
        });
        return;
      }
    }
    this.setState({
      requestPending: true,
    });
    let request = {
      id: movie.id,
      imdb_id: movie.imdb_id,
      tmdb_id: movie.id,
      tvdb_id: "n/a",
      title: movie.title,
      thumb: movie.poster_path,
      type: "movie",
    };
    try {
      await User.request(request, this.props.user.current);
      this.props.msg({
        message: `New Request added: ${movie.title}`,
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
    this.setState({
      requestPending: false,
    });
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

  componentDidMount() {
    this.init();
  }

  getReviews() {
    let id = this.props.match.params.id;
    User.getReviews(id);
  }

  getMovie() {
    let id = this.props.match.params.id;
    // this.getRelated();
    if (!this.props.api.movie_lookup[id]) {
      // check for cached
      Api.movie(id);
    } else if (this.props.api.movie_lookup[id].isMinified) {
      Api.movie(id);
    }
  }

  showTrailer() {
    this.setState({
      trailer: this.state.trailer ? false : true,
    });
  }

  render() {
    let id = this.state.id;
    let movieData = null;
    if (this.props.api.movie_lookup[id])
      movieData = this.props.api.movie_lookup[id];

    if (!movieData || movieData.isMinified || !this.props.user) {
      return <MovieShowLoading />;
    }

    if (movieData.error) {
      return (
        <div className="media-wrap">
          <p className="main-title">Movie Not Found</p>
          <p>
            This movie may have been removed from TMDb or the link you&apos;ve
            followed is invalid
          </p>
        </div>
      );
    }

    let related = null;
    let relatedItems = null;
    if (movieData.recommendations) {
      relatedItems = movieData.recommendations.map((key) => {
        // if (this.props.api.movie_lookup[id]) {
        return (
          <MovieCard
            key={`related-${key}`}
            msg={this.props.msg}
            movie={{ id: key }}
          />
        );
        // }
      });
      related = (
        <section>
          <h3 className="sub-title mb--1">Related Movies</h3>
          <Carousel>{relatedItems}</Carousel>
        </section>
      );
    }

    let video = false;
    if (movieData.videos && movieData.videos.results) {
      for (let i = 0; i < movieData.videos.results.length; i++) {
        let vid = movieData.videos.results[i];
        if (vid.site === "YouTube" && !video) {
          video = vid;
        }
      }
    }

    return (
      <div
        className="media-wrap"
        data-id={movieData.imdb_id}
        key={`${movieData.title}__wrap`}
      >
        <Review
          id={this.props.match.params.id}
          msg={this.props.msg}
          user={this.props.user.current}
          active={this.state.reviewOpen}
          closeReview={this.closeReview}
          getReviews={this.getReviews}
          item={movieData}
        />
        <MovieShowTop
          mediaData={movieData}
          video={video}
          openIssues={this.props.openIssues}
          trailer={this.state.trailer}
          requested={this.state.requested}
          request={this.request}
          showTrailer={this.showTrailer}
          requestPending={this.state.requestPending}
        />
        <div className="media-content">
          <MovieShowOverview
            mediaData={movieData}
            video={video}
            user={this.props.user}
            showTrailer={this.showTrailer}
            match={this.props.match}
            openReview={this.openReview}
            externalReviews={movieData.reviews}
            openIssues={this.props.openIssues}
            requested={this.state.requested}
            request={this.request}
            trailer={this.state.trailer}
            requestPending={this.state.requestPending}
          />
          <section>
            <h3 className="sub-title mb--1">Cast</h3>
            <Carousel>
              {movieData.credits.cast.map((cast) => {
                return (
                  <PersonCard
                    key={`person--${cast.name}`}
                    person={cast}
                    character={cast.character}
                  />
                );
              })}
            </Carousel>
          </section>
          {movieData.belongs_to_collection &&
          movieData.collection.length > 0 ? (
            <section>
              <h3 className="sub-title mb--1">
                {movieData.belongs_to_collection.name}
              </h3>
              <Carousel>
                {movieData.collection
                  .sort(function (a, b) {
                    return a - b;
                  })
                  .map((key) => {
                    return (
                      <MovieCard
                        key={`collection-${key}`}
                        msg={this.props.msg}
                        movie={{ id: key }}
                      />
                    );
                  })}
              </Carousel>
            </section>
          ) : null}
          {related}
          <section>
            <h3 className="sub-title mb--1">Reviews</h3>
            {this.props.user.reviews ? (
              <ReviewsList
                reviews={this.props.user.reviews[id]}
                external={movieData.reviews}
              />
            ) : null}
          </section>
        </div>
      </div>
    );
  }
}

Movie = withRouter(Movie);

function MovieContainer(props) {
  return (
    <Movie
      api={props.api}
      user={props.user}
      openIssues={props.openIssues}
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

export default connect(mapStateToProps)(MovieContainer);
