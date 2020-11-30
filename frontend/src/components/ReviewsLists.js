import React from 'react';
import { ReactComponent as StarIcon } from '../assets/svg/star.svg';
import User from '../data/User';
import dateFormat from 'dateformat';
import { getAuth } from '../data/auth';

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
										className={`stars-1 star ${
											review.score > i ? 'active' : ''
										}`}
									>
										<StarIcon />
									</div>
								);
							}
							let thumb = `${getAuth().api}/user/thumb/${
								review.user
							}`;
							return (
								<div
									className="reviews-list--item"
									key={review._id}
								>
									<div className="reviews-list--thumb">
										<div
											className="thumb"
											style={{
												backgroundImage:
													'url(' + thumb + ')',
											}}
										></div>
									</div>
									<div className="reviews-list--content">
										<p>
											{dateFormat(
												review.date,
												'dddd, mmmm dS, yyyy, h:MMtt'
											)}
										</p>
										<div className="stars-wrap">
											{stars}
										</div>
										<p>{review.comment}</p>
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
			</div>
		);
	}
}

export default ReviewsList;
