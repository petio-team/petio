import React from "react";
import { withRouter } from "react-router-dom";
import TvCard from "../components/TvCard";
import Api from "../data/Api";
import Nav from "../data/Nav";
import { ReactComponent as Spinner } from "../assets/svg/spinner.svg";

class Networks extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      results: false,
      scrollWatch: false,
      page: false,
      paginating: false,
      totalPages: false,
      details: false,
    };

    this.getResults = this.getResults.bind(this);
    this.trackScrolling = this.trackScrolling.bind(this);
    this.getDetails = this.getDetails.bind(this);
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
      this.getDetails();
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
    const wrappedElement = document.getElementsByClassName("network--grid")[0];
    if (this.isBottom(wrappedElement)) {
      if (this.state.paginating) return;
      let page = this.state.page;
      this.getResults(page + 1);
    }
  };

  async getDetails() {
    let details = await Api.networkDetails(this.props.match.params.id);
    this.setState({
      details: details,
    });
  }

  async getResults(page = 1) {
    if (this.state.totalPages && page >= this.state.totalPages) {
      return;
    }
    this.setState({
      paginating: true,
    });
    let id = this.props.match.params.id;
    let type = "show";
    let data = await Api.discover(type, page, {
      with_networks: id,
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

  filter(id) {
    switch (id) {
      case 214:
        return "";
      default:
        return "_filter(duotone,ffffff,868c96)";
    }
  }

  render() {
    return (
      <>
        <div className="company--header">
          <h1 className="main-title mb--1 company--title">
            {this.state.details ? (
              <img
                title={this.state.details.name}
                src={`https://image.tmdb.org/t/p/w500${this.filter(
                  this.state.details.id
                )}${this.state.details.logo_path}`}
                className={`co__${this.state.details.id}`}
              />
            ) : null}
            {/* {this.state.details.name} */}
          </h1>
          {this.state.results.length > 0 ? (
            <div className="company--header--bg">
              <div
                className="company--header--bg--item"
                style={{
                  backgroundImage:
                    "url(https://image.tmdb.org/t/p/w300" +
                    this.state.results[0].backdrop_path +
                    ")",
                }}
              ></div>
            </div>
          ) : null}
        </div>
        <section>
          <div className="network--grid">
            {this.state.results ? (
              this.state.results.map((result) => {
                return (
                  <div
                    className="network--grid--card"
                    key={`gen__${result.id}`}
                  >
                    <TvCard series={result} msg={this.props.msg} view={true} />
                  </div>
                );
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

export default withRouter(Networks);
