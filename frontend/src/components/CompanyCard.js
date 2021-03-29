import React from "react";
import { Link } from "react-router-dom";
import { LazyLoadImage } from "react-lazy-load-image-component";

class CompanyCard extends React.Component {
  render() {
    const company = this.props.company;
    return (
      <div ref={this.card} className="company-card">
        <div className="company-card--inner">
          <Link to={`/company/${company.id}`} className="full-link"></Link>
          <div className="company-card--image">
            <LazyLoadImage
              alt={company.name}
              src={`https://image.tmdb.org/t/p/w200${company.logo_path}`}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default CompanyCard;
