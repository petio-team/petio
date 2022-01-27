import { connect } from "react-redux";
import styles from "../styles/views/search.module.scss";
import typo from "../styles/components/typography.module.scss";
import Meta from "../components/meta";
import Carousel from "../components/carousel";
import { useEffect, useState } from "react";
import media from "../services/media.service";
import { useHistory } from "react-router-dom";

const mapStateToProps = (state) => {
  return {
    searchQuery: state.media.searchQuery,
    searchResults: state.media.searchResults,
  };
};

function Search({ searchQuery, searchResults, newNotification }) {
  const [loading, setLoading] = useState(false);
  const history = useHistory();

  useEffect(() => {
    // clearResults()
    setLoading(true);
    async function submitSearch() {
      try {
        media.search(searchQuery);
        setDisplay(searchQuery);
        setLoading(false);
      } catch (e) {
        newNotification({ type: "error", message: e });
        setLoading(false);
      }
    }
    if (searchQuery.length === 0) {
      history.push("/");
      return;
    }
    const to = setTimeout(() => {
      submitSearch();
    }, 500);
    return () => clearTimeout(to);
    // eslint-disable-next-line
  }, [searchQuery]);
  return (
    <div className={styles.wrap}>
      <Meta title={`Search - ${searchQuery}`} />
      <div className="container">
        <div className={styles.query}>
          <p className={`${typo.body} ${typo.bold}`}>Search Results for:</p>
          <p className={`${typo.xltitle} ${typo.bold}`}>{searchQuery}</p>
        </div>
      </div>

      {!loading &&
      searchResults.movies.length === 0 &&
      searchResults.shows.length === 0 &&
      searchResults.people.length === 0 &&
      searchResults.companies.length === 0 ? (
        <div className="container">
          <p className={styles.no_results}>No results</p>
        </div>
      ) : null}

      {!loading && searchResults.movies.length > 0 ? (
        <Carousel
          title="Results in Movies"
          data={searchResults.movies}
          type="movie"
          key="search_m"
          id="search_m"
        />
      ) : null}
      {!loading && searchResults.shows.length > 0 ? (
        <Carousel
          title="Results in TV"
          data={searchResults.shows}
          type="tv"
          key="search_tv"
          id="search_tv"
        />
      ) : null}
      {!loading && searchResults.people.length > 0 ? (
        <Carousel
          title="Results in people"
          data={searchResults.people}
          type="people"
          key="search_p"
          id="search_p"
        />
      ) : null}
      {!loading && searchResults.companies.length > 0 ? (
        <Carousel
          title="Results in studios"
          data={searchResults.companies}
          type="company"
          key="search_s"
          id="search_s"
        />
      ) : null}
    </div>
  );
}

export default connect(mapStateToProps)(Search);
