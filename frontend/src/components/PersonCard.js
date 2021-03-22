import React from "react";
import { withRouter, Link } from "react-router-dom";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";

class PersonCard extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      imgLoaded: false,
    };

    this.imgLoaded = this.imgLoaded.bind(this);
  }

  imgLoaded() {
    this.setState({
      imgLoaded: true,
    });
  }

  render() {
    let knownFor = null;
    let person = this.props.person;
    if (!person || person.gender === 0) {
      return null;
    }
    if (person.known_for && person.known_for.length) {
      person.known_for.map((item) => {
        return (
          <Link key={`${item.id}__kf`} to={`/movie/${item.id}`}>
            {item.title}
          </Link>
        );
      });
    }

    return (
      <div
        key={person.id}
        className={`card person-card ${
          this.state.imgLoaded ? "img-loaded" : "img-not-loaded"
        }`}
      >
        <div className="card--inner">
          <Link to={`/person/${person.id}`} className="full-link"></Link>
          <div className="image-wrap">
            <LazyLoadImage
              alt={person.name}
              src={
                person.profile_path
                  ? `https://image.tmdb.org/t/p/w200${person.profile_path}`
                  : `${window.location.pathname.replace(
                      /\/$/,
                      ""
                    )}/images/no-poster-person.jpg`
              }
              onLoad={this.imgLoaded}
            />
          </div>
          <div className="text-wrap">
            <p className="title">{person.name}</p>
            {knownFor ? <p className="known-for">{knownFor}</p> : null}
            {this.props.character ? (
              <p className="character">{this.props.character}</p>
            ) : null}
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(PersonCard);
