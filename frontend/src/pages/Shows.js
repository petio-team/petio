import React from "react";
import { withRouter, Link } from "react-router-dom";
import { connect } from "react-redux";
import Api from "../data/Api";
import Popular from "../components/Popular";
import History from "../components/History";
import ShowCard from "../components/TvCard";
import Carousel from "../components/Carousel";

class Shows extends React.Component {
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
        <h1 className="main-title mb--1">TV Shows</h1>
        <Popular type="show" />
        <History type="show" />
        <section>
          <h3 className="sub-title mb--1">Trending Shows</h3>
          <p>Shows trending online right now</p>
          <Carousel>
            {Object.keys(this.props.api.popular).length > 0
              ? this.props.api.popular.tv.map((tv) => {
                  return <ShowCard key={tv.id} msg={this.props.msg} series={tv} />;
                })
              : null}
          </Carousel>
        </section>
      </>
    );
  }
}

Shows = withRouter(Shows);

function MoviesContainer(props) {
  return <Shows api={props.api} msg={props.msg} />;
}

const mapStateToProps = function (state) {
  return {
    api: state.api,
  };
};

export default connect(mapStateToProps)(MoviesContainer);
