import React from "react";
import { withRouter } from "react-router-dom";
import TvCard from "../components/TvCard";
import Api from "../data/Api";
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
    this.getResults();
    this.getDetails();
    setTimeout(() => {
      this.getResults(2);
    }, 200);
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
  }

  componentWillUnmount() {
    document
      .getElementsByClassName("page-wrap")[0]
      .removeEventListener("scroll", this.trackScrolling);
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

  render() {
    return (
      <>
        <section>
          <h1 className="main-title mb--1 network--title">
            {this.state.details ? (
              <img
                title={this.state.details.name}
                src={`https://image.tmdb.org/t/p/w500${this.state.details.logo_path}`}
              />
            ) : null}
          </h1>
        </section>
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
