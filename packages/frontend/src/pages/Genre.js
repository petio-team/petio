import React from "react";
import { withRouter } from "react-router-dom";
import MovieCard from "../components/MovieCard";
import TvCard from "../components/TvCard";
import Api from "../data/Api";
import Nav from "../data/Nav";

import { ReactComponent as GenreAction } from "../assets/svg/genres/action.svg";
import { ReactComponent as GenreAdventure } from "../assets/svg/genres/adventure.svg";
import { ReactComponent as GenreAnimation } from "../assets/svg/genres/animation.svg";
import { ReactComponent as GenreComedy } from "../assets/svg/genres/comedy.svg";
import { ReactComponent as GenreCrime } from "../assets/svg/genres/crime.svg";
import { ReactComponent as GenreDocumentary } from "../assets/svg/genres/documentary.svg";
import { ReactComponent as GenreDrama } from "../assets/svg/genres/drama.svg";
import { ReactComponent as GenreFamily } from "../assets/svg/genres/family.svg";
import { ReactComponent as GenreFantasy } from "../assets/svg/genres/fantasy.svg";
import { ReactComponent as GenreHistory } from "../assets/svg/genres/history.svg";
import { ReactComponent as GenreHorror } from "../assets/svg/genres/horror.svg";
import { ReactComponent as GenreMusic } from "../assets/svg/genres/music.svg";
import { ReactComponent as GenreMystery } from "../assets/svg/genres/mystery.svg";
import { ReactComponent as GenreRomance } from "../assets/svg/genres/romance.svg";
import { ReactComponent as GenreScienceFiction } from "../assets/svg/genres/science-fiction.svg";
import { ReactComponent as GenreTvMovie } from "../assets/svg/genres/tv-movie.svg";
import { ReactComponent as GenreThriller } from "../assets/svg/genres/thriller.svg";
import { ReactComponent as GenreWar } from "../assets/svg/genres/war.svg";
import { ReactComponent as GenreWestern } from "../assets/svg/genres/western.svg";
import { ReactComponent as GenreAnime } from "../assets/svg/genres/anime.svg";
import { ReactComponent as Spinner } from "../assets/svg/spinner.svg";

class Genre extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      results: false,
      scrollWatch: false,
      page: false,
      paginating: false,
      totalPages: false,
    };

    this.getResults = this.getResults.bind(this);
    this.trackScrolling = this.trackScrolling.bind(this);
  }
  genreName() {
    switch (parseInt(this.props.match.params.id)) {
      case 12:
        return "Adventure";
      case 14:
        return "Fantasy";
      case 16:
        return "Animation";
      case 18:
        return "Drama";
      case 27:
        return "Horror";
      case 28:
        return "Action";
      case 35:
        return "Comedy";
      case 36:
        return "History";
      case 37:
        return "Western";
      case 53:
        return "Thriller";
      case 80:
        return "Crime";
      case 99:
        return "Documentary";
      case 878:
        return "Science Fiction";
      case 9648:
        return "Mystery";
      case 10402:
        return "Music";
      case 10752:
        return "War";
      case 10770:
        return "TV Movie";
      case 10749:
        return "Romance";
      case 10751:
        return "Family";
      case 10759:
        return "Action & Adventure";
      case 10762:
        return "Kids";
      case 10763:
        return "News";
      case 10764:
        return "Reality";
      case 10765:
        return "Sci-Fi & Fantasy";
      case 10766:
        return "Soap";
      case 10767:
        return "Talk";
      case 10768:
        return "War & Politics";
      case 210024:
        return "Anime";
      default:
        return `Genre ${this.props.match.params.id}`;
    }
  }

  genreIcon(name) {
    switch (name) {
      case "Action":
        return <GenreAction />;
      case "Adventure":
        return <GenreAdventure />;
      case "Animation":
        return <GenreAnimation />;
      case "Comedy":
        return <GenreComedy />;
      case "Crime":
        return <GenreCrime />;
      case "Documentary":
        return <GenreDocumentary />;
      case "Drama":
        return <GenreDrama />;
      case "Family":
        return <GenreFamily />;
      case "Fantasy":
        return <GenreFantasy />;
      case "History":
        return <GenreHistory />;
      case "Horror":
        return <GenreHorror />;
      case "Music":
        return <GenreMusic />;
      case "Mystery":
        return <GenreMystery />;
      case "Romance":
        return <GenreRomance />;
      case "Science Fiction":
        return <GenreScienceFiction />;
      case "TV Movie":
        return <GenreTvMovie />;
      case "Thriller":
        return <GenreThriller />;
      case "War":
        return <GenreWar />;
      case "Western":
        return <GenreWestern />;
      case "Action & Adventure":
        return (
          <>
            <GenreAction />
            <GenreAdventure />
          </>
        );
      case "Kids":
        return <GenreFamily />;
      case "News":
        return null;
      case "Reality":
        return null;
      case "Sci-Fi & Fantasy":
        return (
          <>
            <GenreScienceFiction />
            <GenreFantasy />
          </>
        );
      case "Soap":
        return <GenreTvMovie />;
      case "Talk":
        return null;
      case "War & Politics":
        return <GenreWar />;
      case "Anime":
        return <GenreAnime />;
      default:
        return null;
    }
  }

  componentDidMount() {
    let page = document.querySelectorAll(".page-wrap")[0];
    let scrollY = 0;
    let pHist = Nav.getNav(this.props.location.pathname);
    page.scrollTop = scrollY;

    if (pHist) {
      this.setState(pHist.state);
    } else {
      this.getResults();
      setTimeout(() => {
        this.getResults(2);
      }, 200);
    }
  }

  componentDidUpdate() {
    if (this.state.results && !this.state.scrollWatch) {
      this.setState({
        scrollWatch: true,
      });
      document
        .getElementsByClassName("page-wrap")[0]
        .addEventListener("scroll", this.trackScrolling);
    }

    if (this.state.getPos) {
      this.setState({
        getPos: false,
      });
      this.getPos();
    }
  }

  componentWillUnmount() {
    document
      .getElementsByClassName("page-wrap")[0]
      .removeEventListener("scroll", this.trackScrolling);
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

  isBottom(el) {
    return el.getBoundingClientRect().bottom <= window.innerHeight;
  }

  trackScrolling = () => {
    const wrappedElement = document.getElementsByClassName("genre--grid")[0];
    if (this.isBottom(wrappedElement)) {
      if (this.state.paginating) return;
      let page = this.state.page;
      this.getResults(page + 1);
    }
  };

  async getResults(page = 1) {
    if (this.state.totalPages && page >= this.state.totalPages) {
      return;
    }
    this.setState({
      paginating: true,
    });
    let id = this.props.match.params.id;
    let type = this.props.match.params.type === "tv" ? "show" : "movie";
    let keywords = [210024];
    let data = keywords.includes(parseInt(id))
      ? await Api.discover(type, page, {
          with_keywords: id,
        })
      : await Api.discover(type, page, {
          with_genres: id,
        });
    if (data.results) {
      this.setState({
        results: this.state.results
          ? [...this.state.results, ...data.results]
          : data.results,
        page: page,
        paginating: false,
        totalPages: data.total_pages,
      });
    }
  }

  render() {
    let type = this.props.match.params.type === "tv" ? "TV" : "Movies";
    let genreName = this.genreName();
    return (
      <>
        <section>
          <h1 className="main-title mb--1 genre--title">
            <div className="genre--icon">{this.genreIcon(genreName)}</div>
            {genreName} {type}
          </h1>
        </section>
        <section>
          <div className="genre--grid">
            {this.state.results ? (
              this.state.results.map((result) => {
                if (type === "TV") {
                  return (
                    <div
                      className="genre--grid--card"
                      key={`gen__${result.id}`}
                    >
                      <TvCard
                        series={result}
                        msg={this.props.msg}
                        view={true}
                      />
                    </div>
                  );
                }
                if (type === "Movies") {
                  return (
                    <div
                      className="genre--grid--card"
                      key={`gen__${result.id}`}
                    >
                      <MovieCard
                        movie={result}
                        view={true}
                        msg={this.props.msg}
                      />
                    </div>
                  );
                }
                return <p key={`gen__${result.title}`}>{result.title}</p>;
              })
            ) : this.state.results === "none" ? (
              <p>No results</p>
            ) : (
              <div className="spinner">
                <div>
                  <Spinner />
                </div>
              </div>
            )}
          </div>
        </section>
      </>
    );
  }
}

export default withRouter(Genre);
