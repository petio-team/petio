import React from "react";
import Api from "../data/Api";
import { ReactComponent as MovieIcon } from "../assets/svg/movie.svg";
import { ReactComponent as TvIcon } from "../assets/svg/tv.svg";
import { ReactComponent as Arrow } from "../assets/svg/arrow-left.svg";

class Reviews extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      reviews: false,
      media: false,
      sortBy: "title",
      dir: "DESC",
    };

    this.sortBy = this.sortBy.bind(this);
    this.sortCol = this.sortCol.bind(this);
    this.getReviews = this.getReviews.bind(this);
  }

  componentDidMount() {
    this.getReviews();
  }

  sortBy(a, b) {
    let sortVal = this.state.sortBy;
    let av = a[sortVal];
    let bv = b[sortVal];
    if (!av) av = "";
    if (!bv) bv = "";
    if (typeof av === "string") av = av.toLowerCase();
    if (typeof bv === "string") bv = bv.toLowerCase();
    if (av > bv) {
      return this.state.dir === "DESC" ? 1 : -1;
    }
    if (av < bv) {
      return this.state.dir === "DESC" ? -1 : 1;
    }
    return 0;
  }

  sortCol(type) {
    if (!type) return;
    let sw = this.state.sortBy === type ? true : false;
    let dir = sw ? (this.state.dir === "DESC" ? "ASC" : "DESC") : "DESC";
    this.setState({
      dir: dir,
      sortBy: type,
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
    let reviewsUnsorted = Object.values(this.state.reviews);
    let reviewsSorted = reviewsUnsorted.sort(this.sortBy);
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
                  <th
                    className={`sortable ${
                      this.state.sortBy === "title" ? "active" : ""
                    } ${this.state.dir}`}
                    onClick={() => this.sortCol("title")}
                  >
                    Title
                    <Arrow />
                  </th>
                  <th
                    className={`sortable ${
                      this.state.sortBy === "type" ? "active" : ""
                    } ${this.state.dir}`}
                    onClick={() => this.sortCol("type")}
                  >
                    Type
                    <Arrow />
                  </th>
                  <th
                    className={`sortable ${
                      this.state.sortBy === "score" ? "active" : ""
                    } ${this.state.dir}`}
                    onClick={() => this.sortCol("score")}
                  >
                    Score
                    <Arrow />
                  </th>
                  <th>Comment</th>
                  <th
                    className={`sortable ${
                      this.state.sortBy === "user" ? "active" : ""
                    } ${this.state.dir}`}
                    onClick={() => this.sortCol("user")}
                  >
                    User
                    <Arrow />
                  </th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(reviewsSorted).length > 0
                  ? Object.keys(reviewsSorted).map((r) => {
                      let review = reviewsSorted[r];
                      let type = review.type;

                      return (
                        <tr key={review._id}>
                          <td>
                            {review.title ? review.title : "No title (Legacy)"}
                          </td>
                          <td>
                            <span className="requests--icon">
                              {type ? this.typeIcon(type) : null}
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
