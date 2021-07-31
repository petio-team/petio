import React from "react";
import { withRouter, Link } from "react-router-dom";
import { connect } from "react-redux";

class RequestCard extends React.Component {
  render() {
    let request = this.props.request;
    if (!request) {
      return null;
    }
    let img = request.poster_path ? (
      <img
        src={`https://image.tmdb.org/t/p/w200${request.poster_path}`}
        alt={request.title}
      />
    ) : (
      <img src={`/images/no-poster.jpg`} alt={request.title} />
    );
    let type = this.props.user.requests[request.id].type;

    return (
      <div
        key={request.id}
        data-key={request.id}
        className={"card type--movie-tv"}
      >
        <div className="card--inner">
          <Link
            to={`/${type === "tv" ? "series" : "movie"}/${request.id}`}
            className="full-link"
          ></Link>

          <div className="request-count">
            {Object.keys(this.props.user.requests[request.id].users).length}
          </div>

          <div className="image-wrap">{img}</div>
          <div className="text-wrap">
            <p className="title" title={request.title || request.name}>
              {request.title || request.name}
              <span className="year">
                {type === "movie"
                  ? `(${new Date(request.release_date).getFullYear()})`
                  : `(${new Date(
                      request.first_air_date
                    ).getFullYear()} - ${new Date(
                      request.last_air_date
                    ).getFullYear()})`}
              </span>
            </p>
            {this.props.user.current.admin ? (
              <p className="request-info">
                {Object.keys(this.props.user.requests[request.id].users).map(
                  (user) => {
                    return (
                      <span key={`req_info_${request.id}__${user}`}>
                        {this.props.user.requests[request.id].users[user]}
                      </span>
                    );
                  }
                )}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    );
  }
}

RequestCard = withRouter(RequestCard);

function RequestCardContainer(props) {
  return (
    <RequestCard tmdb={props.tmdb} user={props.user} request={props.request} />
  );
}

const mapStateToProps = function (state) {
  return {
    tmdb: state.tmdb,
    user: state.user,
  };
};

export default connect(mapStateToProps)(RequestCardContainer);
