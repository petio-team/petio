import React from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import Api from "../data/Api";
import Popular from "../components/Popular";
import History from "../components/History";
import MovieCard from "../components/MovieCard";
import Carousel from "../components/Carousel";

class Movies extends React.Component {
  componentDidMount() {
    let page = document.querySelectorAll(".page-wrap")[0];
    page.scrollTop = 0;
    window.scrollTo(0, 0);

    if (!Object.keys(this.props.api.popular).length > 0) {
      Api.getPopular();
    }
  }
  render() {
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
