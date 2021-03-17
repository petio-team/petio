import React from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";

class RequestCard extends React.Component {
  render() {
    let request = this.props.request;
    if (!request) {
      return null;
    }

    if (!this.props.user.requests[request.id]) {
      console.log(this.props);
      return null;
    }

    let img = request.poster_path ? (
      <img
        src={`https://image.tmdb.org/t/p/w200${request.poster_path}`}
        alt={request.title}
      />
    ) : (
      <div className="no-poster"></div>
    );
    let type = this.props.user.requests[request.id].type;

    return (
      <div
        key={request.id}
        data-key={request.id}
        className={"card type--movie-tv"}
      >
        <div className="card--inner">
          <div className="request-count">
            {Object.keys(this.props.user.requests[request.id].users).length}
          </div>

          <div className="image-wrap">
            {img}
            <div className="request-users">
              {this.props.users.map((user_id) => {
                return (
                  <div
                    key={`req_${request.id}__${user_id}`}
                    className="request-user"
                  >
                    <div className="user-thumb">
                      <img
                        src={
                          process.env.NODE_ENV === "development"
                            ? `http://localhost:7778/user/thumb/${user_id}`
                            : `/api/user/thumb/${user_id}`
                        }
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="text-wrap">
            <p className="title" title={request.title || request.name}>
              {request.title || request.name}
              <span className="year">
                {type === "movie"
                  ? `(${new Date(request.release_date).getFullYear()})`
                  : `(${new Date(request.first_air_date).getFullYear()})`}
              </span>
            </p>
          </div>
        </div>
      </div>
    );
  }
}

RequestCard = withRouter(RequestCard);

function RequestCardContainer(props) {
  return (
    <RequestCard
      tmdb={props.tmdb}
      user={props.user}
      users={props.users}
      request={props.request}
      keyData={props.keyData}
    />
  );
}

const mapStateToProps = function (state) {
  return {
    tmdb: state.tmdb,
    user: state.user,
  };
};

export default connect(mapStateToProps)(RequestCardContainer);
