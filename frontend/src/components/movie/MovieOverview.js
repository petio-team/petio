import React from "react";
import { Link } from "react-router-dom";
import { ReactComponent as TrailerIcon } from "../../assets/svg/video.svg";
import { ReactComponent as ResIconHd } from "../../assets/svg/720p.svg";
import { ReactComponent as ResIconFHd } from "../../assets/svg/1080p.svg";
import { ReactComponent as ResIconUHd } from "../../assets/svg/4k.svg";
import { ReactComponent as StarIcon } from "../../assets/svg/star.svg";

class MovieOverview extends React.Component {
  findNested(obj, key, value) {
    // Base case
    if (obj[key] === value) {
      return obj;
    } else {
      for (var i = 0, len = Object.keys(obj).length; i < len; i++) {
        if (typeof obj[i] == "object") {
          var found = this.findNested(obj[i], key, value);
          if (found) {
            // If the object was found in the recursive call, bubble it up.
            return found;
          }
        }
      }
    }
  }

  timeConvert(n) {
    var num = n;
    var hours = num / 60;
    var rhours = Math.floor(hours);
    var minutes = (hours - rhours) * 60;
    var rminutes = ("0" + Math.round(minutes)).slice(-2);
    var hrs = rhours < 1 ? "" : rhours === 1 ? "hr" : rhours > 1 ? "hr" : "";
    return `${rhours >= 1 ? rhours : ""}${hrs}${rminutes}`;
  }

  render() {
    let criticRating = this.props.movieData.vote_average;

    let director = this.findNested(this.props.movieData.credits.crew, "job", "Director");

    let screenplay = this.findNested(this.props.movieData.credits.crew, "job", "Screenplay");

    let userRating = "Not Reviewed";
    let userRatingVal = 0;

    let hasReviewed = false;
    if (this.props.user.reviews) {
      if (this.props.user.reviews[this.props.match.params.id] || this.props.externalReviews) {
        let ratingsUser = 0;
        let ignore = 0;
        let total = 0;
        if (this.props.user.reviews[this.props.match.params.id]) {
          for (var i = 0; i < this.props.user.reviews[this.props.match.params.id].length; i++) {
            if (
              this.props.user.reviews[this.props.match.params.id][i].user ==
              this.props.user.current._id
            ) {
              hasReviewed = this.props.user.reviews[this.props.match.params.id][i];
            }
          }
          if (Object.keys(this.props.user.reviews[this.props.match.params.id]).length > 0) {
            Object.keys(this.props.user.reviews[this.props.match.params.id]).map((r) => {
              ratingsUser +=
                (this.props.user.reviews[this.props.match.params.id][r].score / 10) * 100;
            });
          }
          total += Object.keys(this.props.user.reviews[this.props.match.params.id]).length;
        }

        if (this.props.externalReviews) {
          this.props.externalReviews.map((r) => {
            if (r.author_details.rating === null) {
              ignore++;
            } else {
              ratingsUser += (r.author_details.rating / 10) * 100;
            }
          });
          total += this.props.externalReviews.length;
        }

        userRating = `${(ratingsUser / (total - ignore)).toFixed(0)}% (${total - ignore} reviews)`;

        userRatingVal = ratingsUser / (total - ignore);
      }
    }
    let reviewBtn = (
      <button className="btn btn__square" onClick={this.props.openReview}>
        {!hasReviewed ? (
          <>
            <StarIcon />
            Review
          </>
        ) : (
          <>
            <StarIcon />
            Reviewed {(hasReviewed.score / 10) * 100}%
          </>
        )}
      </button>
    );

    return (
      <section>
        <div className="quick-view">
          <div className="side-content">
            <div className="movie-action">
              {this.props.video ? (
                <button onClick={this.props.showTrailer} className="btn btn__square">
                  <TrailerIcon />
                  Trailer
                </button>
              ) : null}
              {reviewBtn}
              <div className="resolutions">
                {this.props.movieData.available_resolutions.includes("4k") ? <ResIconUHd /> : null}
                {this.props.movieData.available_resolutions.includes("1080") ? (
                  <ResIconFHd />
                ) : null}
                {this.props.movieData.available_resolutions.includes("720") ? <ResIconHd /> : null}
              </div>
            </div>
          </div>
          <div className="detail--wrap">
            <div className="detail--content">
              <div className="detail--bar">
                <p>{new Date(this.props.movieData.release_date).getFullYear()}</p>
                <div className="detail--bar--sep">·</div>
                <p className="runtime">{this.timeConvert(this.props.movieData.runtime)}</p>
                <div className="detail--bar--sep">·</div>
                <p>
                  Rating:{" "}
                  <span
                    className={`color-${
                      criticRating > 7.9
                        ? "green"
                        : criticRating > 6.9
                        ? "blue"
                        : criticRating > 4.9
                        ? "orange"
                        : "red"
                    }`}
                  >
                    {criticRating}
                  </span>
                </p>
                <div className="detail--bar--sep">·</div>
                <p>
                  User Rating:{" "}
                  <span
                    className={`color-${
                      userRatingVal > 79
                        ? "green"
                        : userRatingVal > 69
                        ? "blue"
                        : userRatingVal > 49
                        ? "orange"
                        : "red"
                    }`}
                  >
                    {userRating}
                  </span>
                </p>
              </div>
              <div className="genre--wrap">
                {this.props.movieData.genres.map((genre, i) => {
                  // if (i === this.props.movieData.genres.length - 1) return genre.name;
                  return <div className="genre--item">{genre.name}</div>;
                })}
              </div>
              <div className="movie-crew">
                {director ? (
                  <div className="movie-crew--item">
                    <p className="sub-title">Director</p>
                    <Link to={`/person/${director.id}`} className="crew-credit">
                      {director.name}
                    </Link>
                  </div>
                ) : null}
                {screenplay ? (
                  <div className="movie-crew--item">
                    <p className="sub-title">Screenplay</p>
                    <Link to={`/person/${screenplay.id}`} className="crew-credit">
                      {screenplay.name}
                    </Link>
                  </div>
                ) : null}
              </div>
              <p className="sub-title mb--1">Synopsis</p>
              <p className="overview">{this.props.movieData.overview}</p>
            </div>
          </div>
        </div>
      </section>
    );
  }
}

export default MovieOverview;
