import React from "react";
import { withRouter } from "react-router-dom";
import MovieCard from "../components/MovieCard";
import Api from "../data/Api";
import { ReactComponent as Spinner } from "../assets/svg/spinner.svg";

class Company extends React.Component {
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
    const wrappedElement = document.getElementsByClassName("company--grid")[0];
    if (this.isBottom(wrappedElement)) {
      if (this.state.paginating) return;
      let page = this.state.page;
      this.getResults(page + 1);
    }
  };

  async getDetails() {
    let details = await Api.companyDetails(this.props.match.params.id);
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
    let type = "movie";
    let data = await Api.discover(type, page, {
      with_companies: id,
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
        <div className="company--header">
          <h1 className="main-title mb--1 company--title">
            {this.state.details ? (
              <img
                title={this.state.details.name}
                src={`https://image.tmdb.org/t/p/w500${this.state.details.logo_path}`}
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
          <div className="company--grid">
            {this.state.results ? (
              this.state.results.map((result) => {
                return (
                  <div
                    className="company--grid--card"
                    key={`gen__${result.id}`}
                  >
                    <MovieCard
                      msg={this.props.msg}
                      movie={result}
                      view={true}
                    />
                  </div>
                );
              })
            ) : this.state.results === "none" ||
              this.state.results.length === 0 ? (
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

export default withRouter(Company);
