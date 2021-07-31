import React from "react";

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
