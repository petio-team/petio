import React from 'react';

const widths = {
	small: 0,
	medium: 0,
	large: 160,
};

class Carousel extends React.Component {
	render() {
		return (
			<div className={`carousel`}>
				<div className="carousel--inner">{this.props.children}</div>
			</div>
		);
	}
}

export default Carousel;
