import React from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import Api from "../data/Api";
import Popular from "../components/Popular";
import History from "../components/History";
import MovieCard from "../components/MovieCard";
import Carousel from "../components/Carousel";
import { ReactComponent as Spinner } from "../assets/svg/spinner.svg";
// import User from "../data/User";

class Movies extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      personalised: false,
      loading: true,
    };

    this.getPersonalised = this.getPersonalised.bind(this);
  }
  componentDidMount() {
    let page = document.querySelectorAll(".page-wrap")[0];
    page.scrollTop = 0;
    window.scrollTo(0, 0);

    if (!Object.keys(this.props.api.popular).length > 0) {
      Api.getPopular();
    }
    this.getPersonalised();
  }

  async getPersonalised() {
    try {
      let personalised = await Api.discoveryMovies();
      this.setState({
        personalised: personalised,
        loading: false,
      });
    } catch {
      console.log("Couldn't load user personalised");
      this.setState({
        loading: false,
      });
    }
  }

  render() {
    if (this.state.loading) {
      return (
        <div className="spinner">
          <div>
            <p>Building your personalised Movie Discovery...</p>
            <Spinner />
          </div>
        </div>
      );
    }
    return (
      <>
        <h1 className="main-title mb--1">Movies</h1>
        <Popular type="movie" />
        <History type="movie" />
        <section>
          <h3 className="sub-title mb--1">Trending Movies</h3>
          <p>Movies trending online right now</p>
          <Carousel>
            {Object.keys(this.props.api.popular).length > 0
              ? this.props.api.popular.movies.map((movie) => {
                  return (
                    <MovieCard
                      key={movie.id}
                      msg={this.props.msg}
                      movie={movie}
                    />
                  );
                })
              : null}
          </Carousel>
        </section>
        {this.state.personalised && this.state.personalised.length > 0
          ? this.state.personalised.map((row, r) => {
              if (!row || row.results.length < 4) return null;
              return (
                <section key={`psn__${r}`}>
                  <h3 className="sub-title mb--1">{row.title}</h3>
                  <Carousel>
                    {row.results.length > 0
                      ? row.results.map((movie) => {
                          if (!movie.id) return null;
                          return (
                            <MovieCard
                              key={`psn__${r}__${movie.id}`}
                              msg={this.props.msg}
                              movie={movie}
                            />
                          );
                        })
                      : null}
                  </Carousel>
                </section>
              );
            })
          : null}
      </>
    );
  }
}

Movies = withRouter(Movies);

function MoviesContainer(props) {
  return <Movies api={props.api} msg={props.msg} />;
}

const mapStateToProps = function (state) {
  return {
    api: state.api,
  };
};

export default connect(mapStateToProps)(MoviesContainer);
