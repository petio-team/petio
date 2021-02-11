import React from "react";
import { ReactComponent as StarIcon } from "../assets/svg/star.svg";
import dateFormat from "dateformat";
import { getAuth } from "../data/auth";

class ReviewsList extends React.Component {
  render() {
    if (!this.props.reviews) {
      return null;
    }
    return (
      <div className="reviews-list--wrap">
        {this.props.reviews
          ? this.props.reviews.length > 0
            ? this.props.reviews.map((review) => {
                let stars = [];
                for (let i = 0; i < 10; i++) {
                  stars.push(
                    <div
                      key={`${review._id}__${i}`}
                      className={`stars-1 star ${
                        review.score > i ? "active" : ""
                      }`}
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
                      <p className="small capped-width__wide content-cap">
                        {review.comment}
                      </p>
                    </div>
                  </div>
                );
              })
            : null
          : null}
        {this.props.external
          ? this.props.external.map((review) => {
              let stars = [];
              if (review.author_details.rating !== null) {
                for (let i = 0; i < 10; i++) {
                  stars.push(
                    <div
                      key={`${review.id}__${i}`}
                      className={`stars-1 star ${
                        review.author_details.rating > i ? "active" : ""
                      }`}
                    >
                      <StarIcon />
                    </div>
                  );
                }
              }
              let thumb = review.author_details.avatar_path
                ? review.author_details.avatar_path.includes("https:")
                  ? review.author_details.avatar_path.substring(1)
                  : `https://www.themoviedb.org/t/p/w128_and_h128_face${review.author_details.avatar_path}`
                : "";

              let text = review.content;
              text = text.replace(
                /\*\*\*(.*?)\*\*\*/g,
                '<span style="display: block; margin: 0"><b>$1</b></span>'
              );
              text = text.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");
              text = text.replace(/__(.*?)__/g, "<u>$1</u>");
              text = text.replace(/_/g, " ");
              text = text.replace(/~~(.*?)~~/g, "<i>$1</i>");
              text = text.replace(/--(.*?)--/g, " ($1) ");
              text = text.replace(/<<(.*?)>>/g, "<a href='$1'>Link</a>");
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
                      {dateFormat(
                        review.updated_at,
                        "dddd, mmmm dS, yyyy, h:MMtt"
                      )}
                    </p>
                    <div className="stars-wrap">{stars}</div>
                    <p
                      className="small capped-width__wide content-cap"
                      dangerouslySetInnerHTML={{ __html: text }}
                    ></p>
                  </div>
                </div>
              );
            })
          : null}
        {this.props.external ? (
          this.props.external.length === 0 &&
          this.props.reviews.length === 0 ? (
            <p>No reviews</p>
          ) : null
        ) : null}
      </div>
    );
  }
}

export default ReviewsList;
