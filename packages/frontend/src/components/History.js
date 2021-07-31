import React from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import Api from "../data/Api";
// import User from '../data/User'
import MovieCard from "./MovieCard";
import Carousel from "./Carousel";
import TvCard from "./TvCard";
import CarouselLoading from "./CarouselLoading";

class History extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      libraries: this.props.user.library_index,
      credentials: false,
      historyData: false,
      user: false,
      text: "Loading",
    };

    this.getHistory = this.getHistory.bind(this);
    this.init = this.init.bind(this);
  }

  componentDidMount() {
    this.init();
  }

  init() {
    if (!this.state.historyData) {
      this.getHistory();
    }
  }

  getHistory() {
    if (this.props.user.current.custom && !this.props.user.current.altId) {
      this.setState({
        text: "No history from the last 2 weeks.",
      });
      return;
    }
    this.setState({
      historyData: [],
    });
    Api.history(
      this.props.user.current.altId
        ? this.props.user.current.altId
        : this.props.user.current.id,
      this.props.type
    )
      .then((res) => {
        if (Object.keys(res).length === 0) {
          this.setState({
            text: "No history from the last 2 weeks.",
          });
          return;
        } else {
          let historyData = res;
          this.setState({
            historyData: historyData,
          });
        }
      })
      .catch((err) => {
        console.log(err);
        this.setState({
          text: "No history from the last 2 weeks.",
        });
      });
  }

  render() {
    if (this.props.type === "movie") {
      let historyData = (
        <>
          <section>
            <h3 className="sub-title mb--1">Recently Viewed Movies by You</h3>
            <p>
              Be sure to review movies you watched to help other users decide
              what to watch!
            </p>
            {Object.keys(this.state.historyData).length > 0 ? (
              <Carousel>
                {Object.keys(this.state.historyData).map((t) => {
                  if (
                    !this.state.historyData[t].id ||
                    this.state.historyData[t].id === "false"
                  ) {
                    return null;
                  }
                  return (
                    <MovieCard
                      key={this.state.historyData[t].id}
                      movie={{
                        id: this.state.historyData[t].id,
                      }}
                    />
                  );
                })}
              </Carousel>
            ) : this.state.text === "Loading" ? (
              <CarouselLoading />
            ) : (
              <p>{this.state.text}</p>
            )}
          </section>
        </>
      );
      return historyData;
    } else {
      let showHistory = (
        <>
          <section>
            <h3 className="sub-title mb--1">Recently Viewed TV Shows by You</h3>
            <p>
              Be sure to review shows you watched to help other users decide
              what to watch!
            </p>
            {Object.keys(this.state.historyData).length > 0 ? (
              <Carousel>
                {Object.keys(this.state.historyData).map((t) => {
                  // console.log(this.state.historyData[t]);
                  if (
                    !this.state.historyData[t].id ||
                    this.state.historyData[t].id === "false"
                  ) {
                    return null;
                  }
                  return (
                    <TvCard
                      key={this.state.historyData[t].id}
                      series={{
                        id: this.state.historyData[t].id,
                      }}
                    />
                  );
                })}
              </Carousel>
            ) : this.state.text === "Loading" ? (
              <CarouselLoading />
            ) : (
              <p>{this.state.text}</p>
            )}
          </section>
        </>
      );
      return showHistory;
    }
  }
}

History = withRouter(History);

function HistoryContainer(props) {
  return <History user={props.user} type={props.type} />;
}

const mapStateToProps = function (state) {
  return {
    user: state.user,
  };
};

export default connect(mapStateToProps)(HistoryContainer);
