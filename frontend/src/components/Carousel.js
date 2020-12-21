import React from "react";
import { ReactComponent as LeftArrow } from "../assets/svg/back.svg";
import { ReactComponent as RightArrow } from "../assets/svg/forward.svg";

const widths = {
  small: 0,
  medium: 0,
  large: 160,
};

class Carousel extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      offset: 0,
      left: true,
      right: true,
    };

    this.carouselRef = React.createRef();
    this.wrapper = React.createRef();
    this.next = this.next.bind(this);
    this.prev = this.prev.bind(this);
    this.init = this.init.bind(this);
    this.scroll = this.scroll.bind(this);
  }

  componentDidMount() {
    this.init();
    window.addEventListener("resize", this.init);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.init);
  }

  init() {
    let carousel = this.carouselRef.current;
    let wrapper = this.wrapper.current;
    let cards = carousel.getElementsByClassName("card");
    let exampleCard = cards[0];
    let style = exampleCard ? exampleCard.currentStyle || window.getComputedStyle(exampleCard) : null;
    let cardWidth = exampleCard ? exampleCard.offsetWidth + parseFloat(style.marginRight) : 0;
    let wrapperWidth = wrapper.offsetWidth;
    let cardsPerView = Math.floor(wrapperWidth / cardWidth);

    this.setState({
      cardsPerView: cardsPerView,
      wrapperWidth: wrapperWidth,
      cardWidth: cardWidth,
      left: false,
      right: cards.length > cardsPerView ? true : false,
    });
  }

  scroll(e) {
    let carousel = this.carouselRef.current;
    let pos = carousel.scrollLeft; //+ carousel.offsetWidth;
    let max = carousel.scrollWidth - carousel.offsetWidth;
    console.log(pos, max);
    this.setState({
      left: pos !== 0 ? true : false,
      right: pos === max ? false : true,
    });
  }

  next() {
    let carousel = this.carouselRef.current;
    let scrollAmount = this.state.cardWidth * this.state.cardsPerView;
    let start = carousel.scrollLeft;
    let movement = Math.floor((start + scrollAmount) / this.state.cardWidth) * this.state.cardWidth;
    console.log(start, scrollAmount, movement);
    carousel.scrollTo({
      top: 0,
      left: movement,
      behavior: "smooth",
    });
  }

  prev() {
    let carousel = this.carouselRef.current;
    let scrollAmount = this.state.cardWidth * this.state.cardsPerView;
    let start = carousel.scrollLeft;
    let movement = Math.floor((start - scrollAmount) / this.state.cardWidth) * this.state.cardWidth;
    console.log(start, scrollAmount, movement);
    carousel.scrollTo({
      top: 0,
      left: movement,
      behavior: "smooth",
    });
  }

  render() {
    return (
      <div className="carousel--wrap" ref={this.wrapper}>
        <div className="carousel--controls">
          <div className={`carousel--controls--item carousel--prev ${this.state.left ? "" : "disabled"}`} onClick={this.prev}>
            <LeftArrow />
          </div>
          <div className={`carousel--controls--item carousel--next ${this.state.right ? "" : "disabled"}`} onClick={this.next}>
            <RightArrow />
          </div>
        </div>
        <div className={`carousel`} ref={this.carouselRef} onScroll={this.scroll}>
          <div className="carousel--inner">{this.props.children}</div>
        </div>
      </div>
    );
  }
}

export default Carousel;
