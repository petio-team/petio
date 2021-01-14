import React from "react";
import { withRouter, Link } from "react-router-dom";
import { connect } from "react-redux";
import Api from "../data/Api";

import MovieShowTop from "../components/MovieShowTop";
import MovieShowOverview from "../components/MovieShowOverview";
import User from "../data/User";
import Review from "../components/Review";
import { ReactComponent as BackIcon } from "../assets/svg/back.svg";

class Season extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      onServer: false,
      show: this.props.match.params.id,
      season: this.props.match.params.season,
      requested: false,
    };

    this.daysTillAir = this.daysTillAir.bind(this);
    this.getReviews = this.getReviews.bind(this);
  }

  componentDidMount() {
    let page = document.querySelectorAll(".page-wrap")[0];
    page.scrollTop = 0;
    window.scrollTo(0, 0);
    let id = this.props.match.params.id;
    let season = this.props.match.params.season;
    this.getReviews();

    if (!this.props.api.series_lookup[id]) {
      // check for cached
      Api.series(id);
    } else if (this.props.api.series_lookup[id].isMinified) {
      Api.series(id);
    }
  }

  getReviews() {
    let id = this.props.match.params.id;
    User.getReviews(id);
  }

  daysTillAir(airDate) {
    var oneDay = 24 * 60 * 60 * 1000;
    var secondDate = new Date();
    var firstDate = new Date(airDate);
    let days = Math.round(Math.abs((firstDate.setHours(0, 0, 0, 0) - secondDate.setHours(0, 0, 0, 0)) / oneDay));

    if (firstDate < secondDate) {
      return <span className="aired">Has aired on tv</span>;
    }

    return days < 100 ? (
      <span className="not-aired">
        airs in {days} {days > 1 ? "days" : "day"}
      </span>
    ) : (
      <span className="not-aired">Not yet aired</span>
    );
  }

  render() {
    let id = this.props.match.params.id;
    let season = this.props.match.params.season;
    let seriesData = this.props.api.series_lookup[id];
    let seasonData = this.props.api.series_lookup[id] ? this.props.api.series_lookup[id].seasonData[season] : false;
    if (seriesData) seriesData.poster_path = seasonData ? seasonData.poster_path : seriesData.poster_path;
    console.log(seasonData);
    let now = new Date();
    now.setHours(0, 0, 0, 0);
    if (!seriesData || !seasonData) {
      return (
        <div className="page-wrap">
          <p>Loading...</p>
        </div>
      );
    } else {
      return (
        <div className="media-wrap" data-id={seriesData.imdb_id} key={`${seriesData.title}__wrap`}>
          <Review id={this.props.match.params.id} user={this.props.user.current} active={this.state.reviewOpen} closeReview={this.closeReview} getReviews={this.getReviews} item={seriesData} />
          <MovieShowTop mediaData={seriesData} trailer={this.state.trailer} requested={this.state.requested} request={this.request} openIssues={this.props.openIssues} />
          <div className="media-content">
            <section>
              <div className="quick-view">
                <div className="side-content">
                  <div className="media-action">
                    <Link to={`/series/${id}`} className="btn btn__square">
                      <BackIcon />
                      Back to {seriesData.name}
                    </Link>
                  </div>
                </div>
                <div className="detail--wrap">
                  <div className="detail--content">
                    <div className="media--actions__mob">
                      <Link to={`/series/${id}`} className="btn btn__square">
                        <BackIcon />
                        Back to {seriesData.name}
                      </Link>
                    </div>
                    <div className="detail--bar">
                      <p>{new Date(seasonData.air_date).getFullYear()}</p>
                      <div className="detail--bar--sep">·</div>
                      <p>{seasonData.name}</p>
                    </div>
                    <p className="sub-title mb--1">Overview</p>
                    <p className="overview">{seasonData.overview}</p>
                  </div>
                </div>
              </div>
            </section>
            <section>
              <h3 className="sub-title mb--1">{`${seasonData.episodes.length} Episodes`}</h3>
              <div className="season-episodes">
                {seasonData.episodes.map((episode) => {
                  let airDate = episode.air_date ? Date.parse(episode.air_date) : false;
                  return (
                    <div className={"season-episode " + (airDate < now ? "aired" : "not-aired")}>
                      <div className="season-episode--img">
                        <img src={`https://image.tmdb.org/t/p/w500/${episode.still_path ? episode.still_path : seriesData.poster_path}`} />
                      </div>
                      <div className="season-episode--info">
                        <p className="upper small ep-num">
                          Season {episode.season_number}: Episode {episode.episode_number} - {this.daysTillAir(airDate)}
                        </p>
                        <h4 className="sub-title">{episode.name}</h4>
                        <p className="small detail">{episode.overview}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        </div>
      );
      // if (seriesData.isMinified) {
      //   return <p>Loading...</p>;
      // }
      // return (
      //   <div
      //     className="page-wrap season-wrap"
      //     style={{
      //       backgroundImage: "url(https://image.tmdb.org/t/p/original/" + seriesData.backdrop_path + ")",
      //     }}
      //   >
      //     <div className="season-inner">
      //       <div className="season-details">
      //         <div className="stick">
      //           <div>
      //             <Link to={`/series/${id}`} className="btn btn__square">
      //               {seriesData.name}
      //             </Link>
      //           </div>
      //           {seriesData.logo ? (
      //             <div>
      //               <img className="media-logo__small" src={seriesData.logo} />
      //             </div>
      //           ) : null}
      //           <h1 className="main-title">{seasonData.name}</h1>
      //           <p className="overview">{seasonData.overview}</p>
      //         </div>
      //       </div>
      //       <div className="season-episodes">
      //         <div className="season-episodes-inner">
      //           {seasonData.episodes.map((episode) => {
      //             let airDate = episode.air_date ? Date.parse(episode.air_date) : false;
      //             return (
      //               <div className={"season-episode " + (airDate < now ? "aired" : "not-aired")}>
      //                 <div className="season-episode--img">
      //                   <img src={`https://image.tmdb.org/t/p/w500/${episode.still_path}`} />
      //                 </div>
      //                 <div className="season-episode--info">
      //                   <p className="upper small ep-num">
      //                     Season {episode.season_number}: Episode {episode.episode_number} - {this.daysTillAir(airDate)}
      //                   </p>
      //                   <h4 className="sub-title">{episode.name}</h4>
      //                   <p className="small detail">{episode.overview}</p>
      //                 </div>
      //                 <div className="season-episode--actions">
      //                   <button className="btn btn__square">Request</button>
      //                   <button className="btn btn__square">Report an issue</button>
      //                 </div>
      //               </div>
      //             );
      //           })}
      //         </div>
      //       </div>
      //     </div>
      //   </div>
      // );
    }
  }
}

Season = withRouter(Season);

function SeasonContainer(props) {
  return <Season api={props.api} user={props.user} openIssues={props.openIssues} />;
}

const mapStateToProps = function (state) {
  return {
    api: state.api,
    user: state.user,
  };
};

export default connect(mapStateToProps)(SeasonContainer);
