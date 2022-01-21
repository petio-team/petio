import React from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import Api from "../data/Api";
import Nav from "../data/Nav";
import MovieCard from "../components/MovieCard";
import Carousel from "../components/Carousel";
import { ReactComponent as Spinner } from "../assets/svg/spinner.svg";
import CarouselLoading from "../components/CarouselLoading";

class Movies extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      personalised: false,
      loading: true,
    };

    this.getPersonalised = this.getPersonalised.bind(this);
    this.getPos = this.getPos.bind(this);
  }

  componentWillUnmount() {
    let page = document.querySelectorAll(".page-wrap")[0];
    let carouselsData = document.querySelectorAll(".carousel");
    let carousels = [];
    carouselsData.forEach((carousel) => {
      carousels.push(carousel.scrollLeft);
    });
    Nav.storeNav("/movies", this.state, page.scrollTop, carousels);
  }

  componentDidMount() {
    let page = document.querySelectorAll(".page-wrap")[0];
    let scrollY = 0;
    let pHist = Nav.getNav("/movies");
    page.scrollTop = scrollY;

    if (pHist) {
      this.setState(pHist.state);
      // if (pHist.state.personalised) {
      //   let ids = [];
      //   pHist.state.personalised.forEach((section) => {
      //     section.results.forEach((movie) => {
      //       ids.push(movie.id);
      //     });
      //   });
      //   Api.batchLookup(ids, "movie");
      //   this.setState(pHist.state);
      // }
    } else {
      if (!Object.keys(this.props.api.popular).length > 0) {
        Api.getPopular();
      }
      this.getPersonalised();
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

  getPos() {
    let page = document.querySelectorAll(".page-wrap")[0];
    let scrollY = 0;
    let pHist = Nav.getNav("/movies");
    if (pHist) {
      scrollY = pHist.scroll;
      document.querySelectorAll(".carousel").forEach((carousel, i) => {
        carousel.scrollLeft = pHist.carousels[i];
      });
    }

    page.scrollTop = scrollY;
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
        {this.state.personalised && this.state.personalised.length > 0
          ? this.state.personalised.map((row, r) => {
              if (!row || row.results.length < 4) return null;
              return (
                <section key={`psn__${r}`}>
                  <h3 className="sub-title mb--1">{row.title}</h3>
                  <Carousel>
                    {row.results.length > 0 ? (
                      row.results.map((movie) => {
                        if (!movie.id) return null;
                        return (
                          <MovieCard
                            key={`psn__${r}__${movie.id}`}
                            msg={this.props.msg}
                            movie={movie}
                          />
                        );
                      })
                    ) : (
                      <CarouselLoading />
                    )}
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
