import React from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import Api from "../data/Api";
import { ReactComponent as SearchIcon } from "../assets/svg/search.svg";
import { ReactComponent as ClearIcon } from "../assets/svg/close.svg";
import MovieCard from "../components/MovieCard";
import TvCard from "../components/TvCard";
import Carousel from "../components/Carousel";
import PersonCard from "../components/PersonCard";
import CarouselLoading from "../components/CarouselLoading";
import CarouselLoadingPerson from "../components/CarouselLoadingPerson";
import CarouselLoadingCompany from "../components/CarouselLoadingCompany";
import CompanyCard from "../components/CompanyCard";
import Nav from "../data/Nav";

class Search extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      searchTerm: "",
      searchActive: false,
      isLoading: false,
    };

    this.handleChange = this.handleChange.bind(this);
    this.clearSearch = this.clearSearch.bind(this);
  }

  clearSearch() {
    this.setState({
      searchTerm: "",
      searchActive: false,
      isLoading: false,
    });
    document.querySelectorAll(".carousel").forEach((carousel) => {
      carousel.scrollLeft = 0;
    });
  }

  handleChange(e) {
    if (e.currentTarget.value.length > 1) {
      let term = e.currentTarget.value;
      this.setState({
        isLoading: true,
      });
      // throttle search lookup during constant typing
      setTimeout(() => {
        if (term === this.state.searchTerm) {
          this.setState({
            isLoading: true,
          });
          Api.search(term)
            .then(() => {
              this.setState({
                isLoading: false,
              });
            })
            .catch(() => {
              this.setState({
                isLoading: false,
              });
            });
        }
      }, 500);
      this.setState({
        searchTerm: e.currentTarget.value,
        searchActive: true,
      });
    } else {
      Api.clearSearch();
      this.setState({
        searchTerm: e.currentTarget.value,
        searchActive: false,
        isLoading: false,
      });
    }
  }

  componentDidMount() {
    Api.getPopular();

    let page = document.querySelectorAll(".page-wrap")[0];
    let scrollY = 0;
    let pHist = Nav.getNav(this.props.location.pathname);
    if (pHist) {
      scrollY = pHist.scroll;
      this.setState(pHist.state);
      document.querySelectorAll(".carousel").forEach((carousel, i) => {
        carousel.scrollLeft = pHist.carousels[i];
      });
    }

    page.scrollTop = scrollY;
  }

  componentWillUnmount() {
    let page = document.querySelectorAll(".page-wrap")[0];
    let carouselsData = document.querySelectorAll(".carousel");
    let carousels = [];
    carouselsData.forEach((carousel) => {
      carousels.push(carousel.scrollLeft);
    });
    Nav.storeNav(
      this.props.location.pathname,
      this.state,
      page.scrollTop,
      carousels
    );
  }

  render() {
    let searchResults = (
      <>
        <section>
          <h3 className="sub-title mb--1">Movies</h3>
          {this.props.api.search_results.movies.length > 0 ? (
            <Carousel>
              {this.props.api.search_results.movies.map((movie) => {
                return (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    msg={this.props.msg}
                  />
                );
              })}
            </Carousel>
          ) : this.state.isLoading ? (
            <CarouselLoading />
          ) : (
            <p>No results</p>
          )}
        </section>
        <section>
          <h3 className="sub-title mb--1">Shows</h3>
          {this.props.api.search_results.series.length > 0 ? (
            <Carousel>
              {this.props.api.search_results.series.map((series) => {
                return (
                  <TvCard
                    key={series.id}
                    series={series}
                    msg={this.props.msg}
                  />
                );
              })}
            </Carousel>
          ) : this.state.isLoading ? (
            <CarouselLoading />
          ) : (
            <p>No results</p>
          )}
        </section>
        <section>
          <h3 className="sub-title mb--1">People</h3>
          {this.props.api.search_results.people.length > 0 ? (
            <Carousel>
              {this.props.api.search_results.people.map((person) => {
                return <PersonCard key={person.id} person={person} />;
              })}
            </Carousel>
          ) : this.state.isLoading ? (
            <CarouselLoadingPerson />
          ) : (
            <p>No results</p>
          )}
        </section>
        <section>
          <h3 className="sub-title mb--1">Studios</h3>
          {this.props.api.search_results.companies &&
          this.props.api.search_results.companies.length > 0 ? (
            <Carousel>
              {this.props.api.search_results.companies.map((company) => {
                if (!company.logo_path) return null;
                return (
                  <CompanyCard
                    key={`co__card__${company.id}`}
                    company={company}
                  />
                );
              })}
            </Carousel>
          ) : this.state.isLoading ? (
            <CarouselLoadingCompany />
          ) : (
            <p>No results</p>
          )}
        </section>
      </>
    );
    let trending = (
      <>
        <section>
          <h3 className="sub-title mb--1">Trending Movies</h3>
          {Object.keys(this.props.api.popular).length > 0 ? (
            <Carousel>
              {Object.keys(this.props.api.popular).length > 0
                ? this.props.api.popular.movies.map((movie) => {
                    return (
                      <MovieCard
                        key={movie.id}
                        movie={movie}
                        msg={this.props.msg}
                      />
                    );
                  })
                : null}
            </Carousel>
          ) : (
            <CarouselLoading />
          )}
        </section>
        <section>
          <h3 className="sub-title mb--1">Trending Shows</h3>
          {Object.keys(this.props.api.popular).length > 0 ? (
            <Carousel>
              {Object.keys(this.props.api.popular).length > 0
                ? this.props.api.popular.tv.map((series) => {
                    return (
                      <TvCard
                        key={series.id}
                        series={series}
                        msg={this.props.msg}
                      />
                    );
                  })
                : null}
            </Carousel>
          ) : (
            <CarouselLoading />
          )}
        </section>
        <section>
          <h3 className="sub-title mb--1">Trending People</h3>

          {Object.keys(this.props.api.popular).length > 0 ? (
            <Carousel>
              {this.props.api.popular.people.map((person) => {
                return <PersonCard key={person.id} person={person} />;
              })}
            </Carousel>
          ) : (
            <CarouselLoadingPerson />
          )}
        </section>
        <section>
          <h3 className="sub-title mb--1">Studios</h3>
          <Carousel>
            {Object.keys(this.props.api.popular).length > 0 ? (
              this.props.api.popular.companies.map((company) => {
                return (
                  <CompanyCard
                    key={`co__card__${company.id}`}
                    company={company}
                  />
                );
              })
            ) : (
              <CarouselLoadingCompany />
            )}
          </Carousel>
        </section>
      </>
    );
    return (
      <div className="search-wrap">
        <section>
          <h1 className="main-title mb--1">Search</h1>
          <div className="search-form">
            <input
              type="text"
              placeholder="Search"
              value={this.state.searchTerm}
              onChange={this.handleChange}
            />
            <button
              className={`search-form--clear ${
                this.state.searchTerm ? "active" : ""
              }`}
              onClick={this.clearSearch}
            >
              <ClearIcon />
            </button>
            <button className="search-btn">
              <SearchIcon />
            </button>
          </div>
        </section>
        {this.state.searchActive ? searchResults : trending}
      </div>
    );
  }
}

Search = withRouter(Search);

function SearchContainer(props) {
  return <Search api={props.api} msg={props.msg} />;
}

const mapStateToProps = function (state) {
  return {
    api: state.api,
  };
};

export default connect(mapStateToProps)(SearchContainer);
