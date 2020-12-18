import React from "react";
import { ReactComponent as StarIcon } from "../assets/svg/star.svg";
import User from "../data/User";
import dateFormat from "dateformat";
import { getAuth } from "../data/auth";

class ReviewsList extends React.Component {
  render() {
    return (
      <div className="reviews-list--wrap">
        {this.props.reviews ? (
          this.props.reviews.length > 0 ? (
            this.props.reviews.map((review) => {
              let stars = [];
              for (let i = 0; i < 10; i++) {
                stars.push(
                  <div
                    key={`${review._id}__${i}`}
                    className={`stars-1 star ${review.score > i ? "active" : ""}`}
                  >
                    <StarIcon />
                  </div>
                );
              }
              let thumb = `${getAuth().api}/user/thumb/${review.user}`;
              return (
                <div className="reviews-list--item" key={review._id}>
                  <div className="reviews-list--thumb">
                    <div
                      className="thumb"
                      style={{
                        backgroundImage: "url(" + thumb + ")",
                      }}
                    ></div>
                  </div>
                  <div className="reviews-list--content">
                    <p className="small">
                      {dateFormat(review.date, "dddd, mmmm dS, yyyy, h:MMtt")}
                    </p>
                    <div className="stars-wrap">{stars}</div>
                    <p className="small capped-width__wide content-cap">{review.comment}</p>
                  </div>
                </div>
              );
            })
          ) : (
            <p>No reviews</p>
          )
        ) : (
          <p>No reviews</p>
        )}
        {this.props.external
          ? this.props.external.map((review) => {
              let stars = [];
              if (review.author_details.rating !== null) {
                for (let i = 0; i < 10; i++) {
                  stars.push(
                    <div
                      key={`${review.id}__${i}`}
                      className={`stars-1 star ${review.author_details.rating > i ? "active" : ""}`}
                    >
                      <StarIcon />
                    </div>
                  );
                }
              }
              let thumb = `https://www.themoviedb.org/t/p/w128_and_h128_face${review.author_details.avatar_path}`;
              return (
                <div className="reviews-list--item" key={review.id}>
                  <div className="reviews-list--thumb">
                    <div
                      className="thumb"
                      style={{
                        backgroundImage: "url(" + thumb + ")",
                      }}
                    ></div>
                  </div>
                  <div className="reviews-list--content">
                    <p className="small">
                      {dateFormat(review.updated_at, "dddd, mmmm dS, yyyy, h:MMtt")}
                    </p>
                    <div className="stars-wrap">{stars}</div>
                    <p className="small capped-width__wide content-cap">{review.content}</p>
                  </div>
                </div>
              );
            })
          : null}
      </div>
    );
  }
}

export default ReviewsList;
