import React from "react";
import CarouselLoading from "../components/CarouselLoading";
import CarouselLoadingPerson from "../components/CarouselLoadingPerson";
import { ReactComponent as Spinner } from "../assets/svg/spinner.svg";

class MovieShowLoading extends React.Component {
  render() {
    return (
      <div className="media-wrap">
        <div className="spinner">
          <Spinner />
        </div>
        <div className="media-top">
          <div className="media-backdrop">
            <div className="no-backdrop"></div>
          </div>
          <div className="media-poster">
            <div className="media-poster--inner"></div>
          </div>
          <div className="media-details">
            <span></span>
            <div className="media-details--top">
              <div className="media-logo placeholder"></div>
            </div>
            <div className="media--actions">
              <div className="btn btn__square placeholder"></div>
              <div className="btn btn__square placeholder"></div>
            </div>
          </div>
        </div>
        <div className="media-content">
          <section>
            <div className="quick-view">
              <div className="side-content">
                <div className="media-action">
                  <div className="btn btn__square placeholder"></div>
                  <div className="btn btn__square placeholder"></div>
                </div>
              </div>
              <div className="detail--wrap">
                <div className="detail--content">
                  <div className="detail--bar">
                    <div className="details text-placeholder"></div>
                  </div>
                  <div className="genre--wrap">
                    <div className="genre--item genre-placeholder"></div>
                    <div className="genre--item genre-placeholder"></div>
                    <div className="genre--item genre-placeholder"></div>
                    <div className="genre--item genre-placeholder"></div>
                  </div>
                  <div className="media--actions__mob mob-btn-placeholder">
                    <div className="btn btn__square placeholder"></div>
                    <div className="btn btn__square placeholder"></div>
                    <div className="btn btn__square placeholder"></div>
                  </div>
                  <div className="media-crew">
                    <div className="media-crew--item text-placeholder"></div>
                    <div className="media-crew--item text-placeholder"></div>
                  </div>
                  <div className="sub-title mb--1 text-placeholder"></div>
                  <div className="overview text-placeholder"></div>
                </div>
              </div>
            </div>
          </section>
          <section>
            <h3 className="sub-title mb--1 text-placeholder"></h3>
            <CarouselLoadingPerson />
          </section>
          <section>
            <h3 className="sub-title mb--1 text-placeholder"></h3>
            <CarouselLoading />
          </section>
        </div>
      </div>
    );
  }
}

export default MovieShowLoading;
