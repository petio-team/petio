import React from "react";
import Api from "../data/Api";
import User from "../data/User";
import Carousel from "../components/Carousel";
import CarouselLoading from "../components/CarouselLoading";
import RequestCard from "../components/RequestCard";
import Bandwidth from "../components/Bandwidth";
import Cpu from "../components/Cpu";
import Ram from "../components/Ram";
import Sessions from "../components/Sessions";

Number.prototype.round = function (places) {
  return +(Math.round(this + "e+" + places) + "e-" + places);
};

class Dashboard extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      requests: false,
      pending: false,
      bandwidth: false,
      serverInfo: false,
      sessions: false,
      sessionsCollapsed: true,
      issues: false,
    };

    this.getRequests = this.getRequests.bind(this);
    this.toggleSessions = this.toggleSessions.bind(this);
    this.getIssues = this.getIssues.bind(this);
  }

  componentDidMount() {
    if (!this.state.pending && !this.state.requests) {
      this.getRequests();
    }
    this.pollServer();
    this.pollServerDelay();
    this.getIssues();
    this.heartbeat = setInterval(() => this.pollServer(), 1000);
    this.heartbeatDelay = setInterval(() => this.pollServerDelay(), 10000);

    let page = document.querySelectorAll(".page-wrap")[0];
    page.scrollTop = 0;
    window.scrollTo(0, 0);
  }

  componentDidUpdate() {
    if (!this.state.pending && !this.state.requests) {
      this.getRequests();
    }
  }

  async getIssues() {
    let issues = await Api.getIssues();
    this.setState({
      issues: issues,
    });
  }

  componentWillUnmount() {
    clearInterval(this.heartbeat);
    clearInterval(this.heartbeatDelay);
  }

  timeDifference(previous) {
    let now = new Date();
    let current = Math.round(now.getTime() / 1000);
    previous = new Date(previous);
    var msPerMinute = 60;
    var msPerHour = msPerMinute * 60;

    var elapsed = current - previous;

    // return elapsed;

    if (elapsed < msPerMinute) {
      return Math.round(elapsed) + "s";
    } else if (elapsed < msPerHour) {
      let minutes = Math.floor(elapsed / msPerMinute);
      let seconds = elapsed - minutes * 60;
      if (minutes === 2 && seconds > 1) return false;
      return `${minutes}m${seconds}s`;
    } else {
      return current;
    }
  }

  pollServer() {
    Api.bandwidth()
      .then((res) => {
        // console.log(res);
        let data = {};
        let bWidth = [];
        res.forEach((el) => {
          let type = el["lan"] ? "Local" : "Remote";
          let timestamp = el["at"];
          if (data[timestamp]) {
            data[timestamp][type] += el["bytes"] * 8;
          } else {
            let time = this.timeDifference(timestamp);
            if (!time) return;
            data[timestamp] = {};
            data[timestamp].name = time;
            data[timestamp].Local = 0;
            data[timestamp].Remote = 0;
            data[timestamp][type] = el["bytes"] * 8;
          }
        });
        Object.keys(data).map((key) => {
          bWidth.push(data[key]);
        });

        this.setState({
          bandwidth: bWidth,
        });
      })
      .catch((err) => {
        console.log(err);
        clearInterval(this.heartbeat);
      });
  }

  pollServerDelay() {
    Api.serverInfo()
      .then((res) => {
        let data = res.StatisticsResources;
        let dataFormatted = [];
        data.map((item) => {
          let time = this.timeDifference(item.at);
          item.at = time;
          if (time) {
            dataFormatted.push(item);
          }
        });

        this.setState({
          serverInfo: dataFormatted,
        });
      })
      .catch((err) => {
        console.log(err);
        // clearInterval(this.heartbeatDelay);
      });

    Api.currentSessions()
      .then((res) => {
        this.setState({
          sessions: res.Metadata,
        });
      })
      .catch((err) => {
        console.log(err);
        // clearInterval(this.heartbeatDelay);
      });
  }

  toggleSessions() {
    this.setState({
      sessionsCollapsed: this.state.sessionsCollapsed ? false : true,
    });
  }

  getRequests() {
    let requests = this.props.user.requests;
    if (!requests) {
      User.getRequests(true);
    } else {
      this.setState({
        requests: true,
        pending: true,
      });

      Object.keys(requests).map((key) => {
        let request = requests[key];
        if (request.type === "movie") {
          Api.movie(key);
        } else {
          Api.series(key);
        }
      });

      this.setState({
        pending: false,
      });
    }
  }

  formatIssue(issue) {
    switch (issue) {
      case "episodes":
        return "Missing Episodes";
      case "subs":
        return "Missing / Wrong Subtitles";
      case "bad-video":
        return "Bad Quality / Video Issue";
      case "bad-audio":
        return "Audio Issue / Audio Sync";
      default:
        return "Not Specified";
    }
  }

  render() {
    let requests = this.props.user.requests;
    return (
      <div className="widget--board">
        {this.state.bandwidth ? (
          <div className="widget--item widget--item__30">
            <div className="widget--item--inner">
              <div className="widget--title">Bandwidth</div>
              <hr />
              <Bandwidth bandwidth={this.state.bandwidth} />
            </div>
          </div>
        ) : null}
        {this.state.serverInfo ? (
          <div className="widget--item widget--item__30">
            <div className="widget--item--inner">
              <div className="widget--title">CPU</div>
              <hr />
              <Cpu cpu={this.state.serverInfo} />
            </div>
          </div>
        ) : null}
        {this.state.serverInfo ? (
          <div className="widget--item widget--item__30">
            <div className="widget--item--inner">
              <div className="widget--title">RAM</div>
              <hr />
              <Ram ram={this.state.serverInfo} />
            </div>
          </div>
        ) : null}
        <div className="widget--item">
          <div className="widget--item--inner">
            <div className="widget--title">Requests</div>
            <hr />
            {!requests ? (
              <CarouselLoading />
            ) : Object.keys(requests).length > 0 ? (
              <Carousel>
                {Object.keys(requests).map((key) => {
                  let request = this.props.api.movie_lookup[key];
                  let users = requests[key].users;
                  if (requests[key].type === "tv") {
                    request = this.props.api.series_lookup[key];
                  }
                  if (!request) return null;
                  return (
                    <RequestCard
                      key={key}
                      keyData={key}
                      users={users}
                      request={request}
                    />
                  );
                })}
              </Carousel>
            ) : (
              <p>No requests</p>
            )}
          </div>
        </div>

        <div
          className={
            "widget--item widget--item__50 " +
            (this.state.sessionsCollapsed ? "collapsed" : "")
          }
        >
          <div className="widget--item--inner">
            <div className="session--toggle" onClick={this.toggleSessions}>
              {this.state.sessionsCollapsed ? "Details" : "Overview"}
            </div>
            <div className="widget--title">Now Playing</div>
            <hr />
            <Sessions sessions={this.state.sessions} />
          </div>
        </div>
        <div className="widget--item widget--item__50">
          <div className="widget--item--inner">
            <div className="widget--title">Issues</div>
            <hr />
            {this.state.issues.length > 0 ? (
              this.state.issues.map((issue) => {
                return (
                  <div className="issue-item" key={`issue_${issue._id}`}>
                    <p className="issue-item--title">{issue.title}</p>
                    <p className="issue-item--detail">
                      <span>Issue:</span> {this.formatIssue(issue.issue)}
                    </p>
                    <p className="issue-item--detail">
                      <span>Comment:</span> {issue.comment}
                    </p>
                  </div>
                );
              })
            ) : (
              <p>No issues</p>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default Dashboard;
