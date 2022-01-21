import React from "react";
import { ReactComponent as LeftArrow } from "../assets/svg/back.svg";
import { ReactComponent as RightArrow } from "../assets/svg/forward.svg";
import { throttle } from "lodash";
// import CarouselLoading from "./CarouselLoading";

class Carousel extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      offset: 0,
      pos: 0,
      init: false,
      width: false,
      inView: false,
    };

    this.carouselRef = React.createRef();
    this.wrapper = React.createRef();
    this.next = this.next.bind(this);
    this.prev = this.prev.bind(this);
    this.init = this.init.bind(this);
    this.scroll = throttle(this.scroll.bind(this), 1000);
    this.isInViewport = throttle(this.isInViewport.bind(this), 1000);
  }

  componentDidMount() {
    let page = document.querySelectorAll(".page-wrap")[0];
    page.scrollTop = 0;
    window.scrollTo(0, 0);
    this.init();
    window.addEventListener("resize", this.init);
    page.addEventListener("scroll", this.isInViewport);
    this.isInViewport();
  }

  componentDidUpdate(prevProps) {
    if (this.props !== prevProps) {
      this.init();
    } else if (this.state.inView && !this.state.init) {
      this.init();
    }
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.init);
    window.removeEventListener("resize", this.isInViewport);
  }

  init() {
    if (!this.state.inView) {
      return;
    }
    let carousel = this.carouselRef.current;
    let wrapper = this.wrapper.current;
    let cards = carousel.getElementsByClassName("card");
    let exampleCard = cards[0];
    let style = exampleCard
      ? exampleCard.currentStyle || window.getComputedStyle(exampleCard)
      : null;
    let cardWidth = exampleCard
      ? exampleCard.offsetWidth + parseFloat(style.marginRight)
      : 0;
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

  isInViewport() {
    if (this.state.inView) {
      let page = document.querySelectorAll(".page-wrap")[0];
      page.removeEventListener("scroll", this.isInViewport);
      return;
    }
    let carousel = this.wrapper.current;
    if (!carousel) return;
    const top = carousel.getBoundingClientRect().top;
    const wH = window.innerHeight;
    if (top <= wH * 1.5) {
      this.setState({
        inView: true,
      });
    } else {
      this.setState({
        inView: this.state.inView ? true : false,
      });
    }
  }

  scroll() {
    let carousel = this.carouselRef.current;
    if (!carousel) return;
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
    let movement =
      Math.floor((start + scrollAmount) / this.state.cardWidth) *
      this.state.cardWidth;
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
    let movement =
      Math.floor((start - scrollAmount) / this.state.cardWidth) *
      this.state.cardWidth;
    carousel.scrollTo({
      top: 0,
      left: movement,
      behavior: "smooth",
    });
  }

  render() {
    const childrenWithProps = React.Children.map(
      this.props.children,
      (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            pos: this.state.pos,
            width: this.state.width ? this.state.width : 0,
          });
        }
        return child;
      }
    );
    return (
      <div
        className={`carousel--wrap ${
          this.state.inView ? "visible" : "not-visible"
        }`}
        ref={this.wrapper}
      >
        <div className="carousel--controls">
          <div
            className={`carousel--controls--item carousel--prev ${
              this.state.pos > 0 ? "" : "disabled"
            }`}
            onClick={this.prev}
          >
            <LeftArrow />
          </div>
          <div
            className={`carousel--controls--item carousel--next ${
              this.state.pos < this.state.max ? "" : "disabled"
            }`}
            onClick={this.next}
          >
            <RightArrow />
          </div>
        </div>
        <div
          className={`carousel`}
          ref={this.carouselRef}
          onScroll={this.scroll}
        >
          <div className="carousel--inner">{childrenWithProps}</div>
        </div>
      </div>
    );
  }
}

export default Carousel;
