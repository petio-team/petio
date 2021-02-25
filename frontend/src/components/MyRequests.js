import React from "react";

class MyRequests extends React.Component {
  render() {
    if (this.props.requests.length === 0) {
      return (
        <div className="myrequests--wrap">
          <div className="myrequests--none">
            <p>
              <strong>You haven&apos;t made any requests yet</strong>
            </p>
          </div>
        </div>
      );
    }
    return (
      <div className="myrequests--wrap">
        <div className="myrequests--grid">
          {Object.keys(this.props.requests).map((key) => {
            let request = this.props.requests[key];
            return (
              <div key={`mreq__${key}`} className="myrequests--item">
                <div
                  className="myrequests--item--thumb"
                  style={{
                    backgroundImage:
                      "url(https://image.tmdb.org/t/p/w200/" +
                      request.thumb +
                      ")",
                  }}
                ></div>
                <div className="myrequests--item--details">
                  <p className="detail-title">{request.title}</p>
                  <p className="detail-text">
                    {request.type === "tv" ? "TV Show" : "Movie"}
                  </p>
                  <p className="detail-text">
                    Status:{" "}
                    <span
                      className={`request-status ${request.process_stage.status}`}
                    >
                      {request.process_stage.message}
                    </span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}

export default MyRequests;
