import React from "react";
import { ReactComponent as StarIcon } from "../assets/svg/star.svg";
import User from "../data/User";

class Review extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      id: this.props.id,
      user: this.props.user,
      rating: 0,
    };

    this.setRating = this.setRating.bind(this);
    this.saveReview = this.saveReview.bind(this);
  }

  setRating(e) {
    this.setState({
      rating: e.currentTarget.dataset.rating,
    });
  }

  async saveReview() {
    try {
      let review = {
        score: this.state.rating,
        comment: "",
      };
      User.review(this.props.item, this.props.user.id, review);
      setTimeout(() => {
        this.props.closeReview();
        this.props.getReviews();
        this.setState({
          rating: 0,
        });
        this.props.msg({
          message: `Review saved`,
          type: "good",
        });
      }, 1000);
    } catch (err) {
      this.props.msg({
        message: `Error adding review`,
        type: "error",
      });
    }
  }

  render() {
    let stars = [];
    for (let i = 0; i < 10; i++) {
      stars.push(
        <div key={`star__${i}`} className={`stars-1 star ${this.state.rating >= i + 1 ? "active" : ""}`} data-rating={i + 1} onClick={this.setRating}>
          <StarIcon />
        </div>
      );
    }
    return (
      <div className={`review--wrap ${this.props.active ? "active" : ""}`}>
        <div className="review--inner">
          <div className="review--top">
            <h3>What did you think?</h3>
          </div>
          <div className="review--main">
            <p>Let other users know what you thought. Please note the review is not related to quality or issues, for issues please report an issue.</p>
            <div className="stars-wrap">{stars}</div>
            <div className="btn btn__square bad close-review" onClick={this.props.closeReview}>
              Cancel
            </div>
            <div className="btn btn__square save-review" onClick={this.saveReview}>
              Save
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Review;
