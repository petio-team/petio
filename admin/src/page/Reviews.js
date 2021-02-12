import React from "react";
import Api from "../data/Api";
import { ReactComponent as MovieIcon } from "../assets/svg/movie.svg";
import { ReactComponent as TvIcon } from "../assets/svg/tv.svg";

class Reviews extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      reviews: false,
      media: false,
    };

    this.getReviews = this.getReviews.bind(this);
    this.getMedia = this.getMedia.bind(this);
  }

  componentDidMount() {
    this.getReviews();
  }

  componentDidUpdate() {
    if (this.state.reviews && !this.state.media) {
      this.setState({
        media: true,
      });
      this.getMedia();
    }
  }

  getMedia() {
    console.log(this.state.reviews);
    this.state.reviews.map((review) => {
      // if (review.type === "movie" || !review.type) {
      if (!this.props.api.movie_lookup[review.tmdb_id]) {
        Api.movie(review.tmdb_id, true);
      }
      if (!this.props.api.series_lookup[review.tmdb_id]) {
        Api.series(review.tmdb_id, true);
      }
      // }
    });
  }

  getUsername(id) {
    if (!this.props.api.users) {
      return null;
    } else if (id in this.props.api.users) {
      return this.props.api.users[id].title;
    } else {
      return null;
    }
  }

  typeIcon(type) {
    let icon = null;
    switch (type) {
      case "movie":
        icon = <MovieIcon />;
        break;
      case "tv":
        icon = <TvIcon />;
        break;
      default:
        icon = null;
    }
    return icon;
  }

  async getReviews() {
    let reviews = await Api.getReviews();
    this.setState({
      reviews: reviews,
    });
  }

  render() {
    return (
      <>
        <div className="reviews--wrap">
          <section>
            <p className="main-title">Reviews</p>
          </section>
          <section>
            <table className="generic-table generic-table__rounded">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Score</th>
                  <th>Comment</th>
                  <th>User</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {this.state.reviews
                  ? this.state.reviews.map((review) => {
                      let media = false;
                      let type = "movie";

                      if (this.props.api.movie_lookup[review.tmdb_id]) {
                        media = !this.props.api.movie_lookup[review.tmdb_id]
                          .error
                          ? this.props.api.movie_lookup[review.tmdb_id]
                          : false;
                      }

                      if (
                        this.props.api.series_lookup[review.tmdb_id] &&
                        !media
                      ) {
                        media = !this.props.api.series_lookup[review.tmdb_id]
                          .error
                          ? this.props.api.series_lookup[review.tmdb_id]
                          : false;
                        type = "tv";
                      }

                      if (!media) {
                        return null;
                      }

                      return (
                        <tr key={review._id}>
                          <td>{type === "movie" ? media.title : media.name}</td>
                          <td>
                            <span className="requests--icon">
                              {this.typeIcon(type)}
                            </span>
                          </td>
                          <td>{review.score}/10</td>
                          <td>{review.comment}</td>
                          <td>{this.getUsername(review.user)}</td>
                          <td></td>
                        </tr>
                      );
                    })
                  : null}
              </tbody>
            </table>
          </section>
        </div>
      </>
    );
  }
}

export default Reviews;
