import React from "react";
import { ReactComponent as LeftArrow } from "../assets/svg/back.svg";
import { ReactComponent as RightArrow } from "../assets/svg/forward.svg";

class Carousel extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      offset: 0,
      pos: 0,
      init: false,
    };

    this.carouselRef = React.createRef();
    this.wrapper = React.createRef();
    this.next = this.next.bind(this);
    this.prev = this.prev.bind(this);
    this.init = this.init.bind(this);
    this.scroll = this.scroll.bind(this);
  }

  static getDerivedStateFromProps(props, current_state) {
    if (current_state.value !== props.value) {
      alert("prop change");
    }
    return null;
  }

  componentDidMount() {
    this.init();
    window.addEventListener("resize", this.init);
  }

  componentDidUpdate(prevProps) {
    if (this.props !== prevProps) {
      this.init();
    }
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
    let max = carousel.scrollWidth - carousel.offsetWidth;

    this.setState({
      cardsPerView: cardsPerView,
      wrapperWidth: wrapperWidth,
      cardWidth: cardWidth,
      init: true,
      width: carousel.offsetWidth,
      max: max,
    });
  }

  scroll(e) {
    let carousel = this.carouselRef.current;
    let position = carousel.scrollLeft; //+ carousel.offsetWidth;
    let max = carousel.scrollWidth - carousel.offsetWidth;
    this.setState({
      width: carousel.offsetWidth,
      pos: position,
      max: max,
    });
  }

  next() {
    let carousel = this.carouselRef.current;
    let scrollAmount = this.state.cardWidth * this.state.cardsPerView;
    let start = carousel.scrollLeft;
    let movement = Math.floor((start + scrollAmount) / this.state.cardWidth) * this.state.cardWidth;
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
    carousel.scrollTo({
      top: 0,
      left: movement,
      behavior: "smooth",
    });
  }

  render() {
    const childrenWithProps = React.Children.map(this.props.children, (child) => {
      if (React.isValidElement(child)) {
        return React.cloneElement(child, { pos: this.state.pos, width: this.state.width });
      }
      return child;
    });
    return (
      <div className="carousel--wrap" ref={this.wrapper} data-width={this.state.width}>
        <div className="carousel--controls">
          <div className={`carousel--controls--item carousel--prev ${this.state.pos > 0 ? "" : "disabled"}`} onClick={this.prev}>
            <LeftArrow />
          </div>
          <div className={`carousel--controls--item carousel--next ${this.state.pos < this.state.max ? "" : "disabled"}`} onClick={this.next}>
            <RightArrow />
          </div>
        </div>
        <div className={`carousel`} ref={this.carouselRef} onScroll={this.scroll}>
          <div className="carousel--inner">{childrenWithProps}</div>
        </div>
      </div>
    );
  }
}

export default Carousel;
