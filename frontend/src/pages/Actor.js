import React from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import Api from "../data/Api";
import Nav from "../data/Nav";
import MovieCard from "../components/MovieCard";
import TvCard from "../components/TvCard";
import Carousel from "../components/Carousel";
import { ReactComponent as Spinner } from "../assets/svg/spinner.svg";

class Actor extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      bioOpen: false,
    };

    this.getActor = this.getActor.bind(this);
    this.handleScroll = this.handleScroll.bind(this);
    this.toggleBio = this.toggleBio.bind(this);
  }

  componentDidMount() {
    let page = document.querySelectorAll(".page-wrap")[0];
    let scrollY = 0;
    let pHist = Nav.getNav(this.props.location.pathname);
    page.scrollTop = scrollY;

    if (pHist) {
      this.setState(pHist.state);
    } else {
      let id = this.props.match.params.id;
      this.getActor(id);
    }
  }

  componentDidUpdate() {
    if (this.state.getPos) {
      this.setState({
        getPos: false,
      });
      this.getPos();
    }
  }

  componentWillUnmount() {
    let page = document.querySelectorAll(".page-wrap")[0];
    let carouselsData = document.querySelectorAll(".carousel");
    let carousels = [];
    carouselsData.forEach((carousel) => {
      carousels.push(carousel.scrollLeft);
    });
    let state = this.state;
    state.scrollWatch = false;
    Nav.storeNav(
      this.props.location.pathname,
      state,
      page.scrollTop,
      carousels
    );
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

  getActor(id) {
    if (!this.props.api.person_lookup[id]) {
      // check for cached
      Api.person(id);
    }
  }

  handleScroll(e) {
    let banner = e.currentTarget.querySelectorAll(".person--banner")[0];
    let poster = e.currentTarget.querySelectorAll(".person--thumb--inner")[0];
    let offset =
      e.currentTarget.scrollTop > banner.offsetHeight
        ? 1
        : e.currentTarget.scrollTop / banner.offsetHeight;
    let posterOffset = 10 * offset;
    offset = offset * 10 + 40;
    banner.style.backgroundPosition = `50% ${offset}%`;
    poster.style.transform = `translateY(${posterOffset}px)`;
  }

  sortByRanking(a, b) {
    if (a.ranking < b.ranking) {
      return 1;
    }
    if (a.ranking > b.ranking) {
      return -1;
    }
    return 0;
  }

  processCredits(credits, items) {
    for (let i in items) {
      let item = items[i];
      if (!credits[item.id]) {
        let ranking = Math.round(item.popularity * item.vote_count);
        item.ranking = ranking;
        credits[item.id] = item;
      }

      if (item.job) {
        if (credits[item.id].jobs) {
          credits[item.id].jobs[item.job] = item.job;
        } else {
          credits[item.id].jobs = new Array();
          credits[item.id].jobs[item.job] = item.job;
        }
      }
      if (item.character) {
        if (credits[item.id].characters) {
          credits[item.id].characters[item.character] = item.character;
        } else {
          credits[item.id].characters = new Array();
          credits[item.id].characters[item.character] = item.character;
        }
      }
    }
    return credits;
  }

  processCredit(item, personData) {
    let credit = null;

    if (personData.known_for_department !== "Acting") {
      // Not actor
      credit = item.jobs ? item.jobs : item.characters ? item.characters : null;
    } else {
      // actor
      credit = item.characters ? item.characters : item.jobs ? item.jobs : null;
    }

    if (credit) {
      let output = "";
      for (let i in credit) {
        output += `${credit[i]} / `;
      }
      credit = output;
      credit = credit.substring(0, credit.length - 3);
    }

    return credit;
  }

  toggleBio() {
    this.setState({
      bioOpen: this.state.bioOpen ? false : true,
    });
  }

  render() {
    let id = this.props.match.params.id;
    let personData = this.props.api.person_lookup[id];

    if (!personData) {
      return (
        <div className="page-wrap">
          <div className="spinner">
            <Spinner />
          </div>
        </div>
      );
    }

    if (personData.success === false) {
      return (
        <div className="page-wrap">
          <p className="main-title">Person Not Found</p>
          <p>
            This person may have been removed from TMDb or the link you&apos;ve
            followed is invalid
          </p>
        </div>
      );
    }

    let banner = false;
    let bWidth = 0;

    // Credits Movie
    let movieCredits = this.props.api.actor_movie[id];
    let moviesList = false;

    if (movieCredits) {
      moviesList = {};
      moviesList = this.processCredits(moviesList, movieCredits.cast);
      moviesList = this.processCredits(moviesList, movieCredits.crew);
      moviesList = Object.values(moviesList);
      moviesList.sort(this.sortByRanking);
    }

    // Credits TV
    let tvCredits = this.props.api.actor_series[id];
    let showsList = false;

    if (tvCredits) {
      showsList = {};
      showsList = this.processCredits(showsList, tvCredits.cast);
      showsList = this.processCredits(showsList, tvCredits.crew);
      showsList = Object.values(showsList);
      showsList.sort(this.sortByRanking);
    }

    if (!personData.images) {
      banner = false;
      bWidth = 0;
    } else {
      personData.images.profiles.forEach((image) => {
        if (image.width > bWidth) {
          banner = image;
          bWidth = image.width;
        }
      });
    }

    return (
      <>
        <div className="page-wrap" onScroll={this.handleScroll}>
          <div className="generic-wrap">
            <div className="person--wrap">
              <div
                className="person--banner"
                style={{
                  backgroundImage: `url(https://image.tmdb.org/t/p/original${banner.file_path})`,
                }}
              ></div>
              <div className="person--top">
                <div className="person--thumb">
                  <div className="person--thumb--inner">
                    {personData.profile_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w500${personData.profile_path}`}
                      />
                    ) : (
                      <img src="/images/no-poster-person.jpg" />
                    )}
                  </div>
                </div>
                <div className="person--details">
                  <h1 className="single-title">{personData.name}</h1>
                  <p>{personData.place_of_birth}</p>
                  <p>{personData.known_for_department}</p>
                </div>
              </div>
              <section>
                <div className="person--bio">
                  <h3 className="sub-title mb--1">Biography</h3>
                  {personData.biography ? (
                    <div className={`bio ${this.state.bioOpen ? "open" : ""}`}>
                      {personData.biography.split("\n").map((str, i) => (
                        <p key={`bio-${i}`}>{str}</p>
                      ))}
                    </div>
                  ) : null}
                  <p
                    onClick={this.toggleBio}
                    className="person--bio--read-more"
                  >
                    {this.state.bioOpen ? "Read less" : "Read more"}
                  </p>
                </div>
              </section>
              {moviesList.length > 0 ? (
                <section>
                  <h3 className="sub-title mb--1">Movies</h3>
                  <Carousel>
                    {Object.keys(moviesList).map((key, i) => {
                      let result = moviesList[key];
                      if (result.rating < 100) return null; // threshold to display
                      return (
                        <MovieCard
                          key={result.id + "-cast-" + i}
                          movie={result}
                          msg={this.props.msg}
                          character={this.processCredit(result, personData)}
                        />
                      );
                    })}
                  </Carousel>
                </section>
              ) : null}
              {showsList.length > 0 ? (
                <section>
                  <h3 className="sub-title mb--1">TV</h3>
                  <Carousel>
                    {Object.keys(showsList).map((key, i) => {
                      let result = showsList[key];
                      if (result.rating < 100) return null; // threshold to display
                      return (
                        <TvCard
                          key={result.id + "-cast-" + i}
                          series={result}
                          msg={this.props.msg}
                          character={this.processCredit(result, personData)}
                        />
                      );
                    })}
                  </Carousel>
                </section>
              ) : null}
            </div>
          </div>
        </div>
      </>
    );
  }
}

Actor = withRouter(Actor);

function ActorContainer(props) {
  return <Actor api={props.api} msg={props.msg} />;
}

const mapStateToProps = function (state) {
  return {
    api: state.api,
  };
};

export default connect(mapStateToProps)(ActorContainer);
