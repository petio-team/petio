import React from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import Api from "../data/Api";
// import User from '../data/User'
import MovieCard from "./MovieCard";
import TvCard from "./TvCard";
import Carousel from "./Carousel";
import CarouselLoading from "./CarouselLoading";

class Popular extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      libraries: this.props.user.library_index,
      credentials: false,
      topData: false,
    };

    this.getTop = this.getTop.bind(this);
    this.init = this.init.bind(this);
  }

  componentDidMount() {
    this.init();
  }

  init() {
    if (!this.state.topData) {
      this.getTop("movies");
    }
  }

  getTop() {
    Api.top(this.props.type)
      .then((res) => {
        this.setState({
          topData: res,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }

  render() {
    if (this.props.type === "movie") {
      let topData = (
        <>
          <section>
            <h3 className="sub-title mb--1">Popular on Plex</h3>
            {this.state.topData ? (
              <Carousel>
                {Object.keys(this.state.topData).map((t) => {
                  if (
                    !this.state.topData[t].item.tmdb_id ||
                    this.state.topData[t].item.tmdb_id === "false"
                  ) {
                    return null;
                  }
                  return (
                    <MovieCard
                      key={`${this.state.topData[t].item.tmdb_id}__top_movie`}
                      movie={{
                        id: this.state.topData[t].item.tmdb_id,
                      }}
                      popular_count={this.state.topData[t].globalViewCount}
                    />
                  );
                })}
              </Carousel>
            ) : (
              <CarouselLoading />
            )}
          </section>
        </>
      );
      return topData;
    } else {
      let topShows = (
        <>
          <section>
            <h3 className="sub-title mb--1">Popular on Plex</h3>
            {this.state.topData ? (
              <Carousel>
                {Object.keys(this.state.topData).map((t) => {
                  if (
                    !this.state.topData[t].item.tmdb_id ||
                    this.state.topData[t].item.tmdb_id === "false"
                  ) {
                    return null;
                  }
                  return (
                    <TvCard
                      key={`${this.state.topData[t].item.tmdb_id}__top_tv`}
                      series={{
                        id: this.state.topData[t].item.tmdb_id,
                      }}
                      popular_count={this.state.topData[t].globalViewCount}
                    />
                  );
                })}
              </Carousel>
            ) : (
              <CarouselLoading />
            )}
          </section>
        </>
      );
      return topShows;
    }
  }
}

Popular = withRouter(Popular);

function PopularContainer(props) {
  return <Popular user={props.user} type={props.type} />;
}

const mapStateToProps = function (state) {
  return {
    user: state.user,
  };
};

export default connect(mapStateToProps)(PopularContainer);
