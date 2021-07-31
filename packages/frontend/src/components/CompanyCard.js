import React from "react";
import { Link } from "react-router-dom";
import { LazyLoadImage } from "react-lazy-load-image-component";

class CompanyCard extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      inView: false,
      imgLoaded: false,
    };

    this.card = React.createRef();
    this.inView = this.inView.bind(this);
    this.imgLoaded = this.imgLoaded.bind(this);
  }

  componentDidMount() {
    this.inView();
  }

  componentDidUpdate() {
    if (!this.state.inView) {
      this.inView();
    }
  }

  inView() {
    if (!this.card.current) return;
    const left = this.card.current.getBoundingClientRect().left;
    if (left <= this.props.width * 2 || this.props.view) {
      this.setState({
        inView: true,
      });
    }
  }

  imgLoaded() {
    this.setState({
      imgLoaded: true,
    });
  }

  render() {
    const company = this.props.company;
    return (
      <div
        ref={this.card}
        key={`co__${company.id}`}
        data-key={`co__${company.id}`}
        className={`card company-card ${
          this.state.imgLoaded ? "img-loaded" : "img-not-loaded"
        }`}
      >
        <div className="company-card--inner">
          <Link to={`/company/${company.id}`} className="full-link"></Link>
          {company.logo_path ? (
            <div className="company-card--image">
              <LazyLoadImage
                alt={company.name}
                src={`https://image.tmdb.org/t/p/w500_filter(duotone,ffffff,868c96)${company.logo_path}`}
                onLoad={this.imgLoaded}
              />
            </div>
          ) : (
            <div className="company-card--name">
              <p>{company.name}</p>
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default CompanyCard;
