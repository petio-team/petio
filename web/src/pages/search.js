import { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';

import Carousel from '../components/Carousel';
import Meta from '../components/meta';
import media from '../services/media.service';
import typo from '../styles/components/typography.module.scss';
import styles from '../styles/views/search.module.scss';

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
    // setLoading(true);
    async function submitSearch() {
      try {
        await media.search(searchQuery);
        setLoading(false);
      } catch (e) {
        newNotification({ type: 'error', message: e });
        setLoading(false);
      }
    }
    if (searchQuery.length === 0) {
      history.push('/');
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
      searchResults &&
      searchResults.movies.length === 0 &&
      searchResults.shows.length === 0 &&
      searchResults.people.length === 0 &&
      searchResults.companies.length === 0 ? (
        <div className="container">
          <p className={styles.no_results}>No results</p>
        </div>
      ) : null}

      {!loading && searchResults && searchResults.movies.length > 0 ? (
        <Carousel
          title="Results in Movies"
          data={searchResults.movies}
          type="movie"
          key="search_m"
          id="search_m"
        />
      ) : null}
      {!loading && searchResults && searchResults.shows.length > 0 ? (
        <Carousel
          title="Results in TV"
          data={searchResults.shows}
          type="tv"
          key="search_tv"
          id="search_tv"
        />
      ) : null}
      {!loading && searchResults && searchResults.people.length > 0 ? (
        <Carousel
          title="Results in people"
          data={searchResults.people}
          type="people"
          key="search_p"
          id="search_p"
        />
      ) : null}
      {!loading && searchResults && searchResults.companies.length > 0 ? (
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
