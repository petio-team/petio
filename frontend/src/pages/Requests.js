import React from "react";
import { withRouter, Link } from "react-router-dom";
import { connect } from "react-redux";
import Api from "../data/Api";
import { ReactComponent as Spinner } from "../assets/svg/spinner.svg";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import { ReactComponent as MovieIcon } from "../assets/svg/movie.svg";
import { ReactComponent as TvIcon } from "../assets/svg/tv.svg";
import User from "../data/User";
import MyRequests from "../components/MyRequests";

class Requests extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      requests: false,
      archive: false,
      loaded: false,
      calendar: false,
      calendarData: false,
    };

    this.getRequests = this.getRequests.bind(this);
    this.getCalendar = this.getCalendar.bind(this);
    this.getCalendarData = this.getCalendarData.bind(this);
    this.getArchive = this.getArchive.bind(this);
    this.typeIcon = this.typeIcon.bind(this);
  }

  componentDidMount() {
    let page = document.querySelectorAll(".page-wrap")[0];
    page.scrollTop = 0;
    window.scrollTo(0, 0);
    this.getRequests();
    this.getCalendar();
    this.getArchive();
  }

  async getCalendar() {
    try {
      let data = await Api.guideCalendar();
      this.setState({
        calendar: data,
      });
      this.getCalendarData();
    } catch (err) {
      console.log(err);
    }
  }

  getCalendarData() {
    let calendarData = this.state.calendar.map((item) => {
      if (item.series) {
        let time = new Date(item.airDateUtc);
        return ({
          title: `${item.series.title} - S${item.seasonNumber.toLocaleString(
            "en-US",
            {
              minimumIntegerDigits: 2,
              useGrouping: false,
            }
          )}E${item.episodeNumber.toLocaleString("en-US", {
            minimumIntegerDigits: 2,
            useGrouping: false,
          })}`,
          allDay: false,
          start: time,
          end: time,
          resource: item,
        });
      } else {
        let time = new Date(item.inCinemas);
        return ({
          title: item.title,
          allDay: true,
          start: time,
          end: time,
          resource: item,
        });
      }
    });

    this.setState({
      calendarData
    });
  }

  async getRequests() {
    let requests;
    try {
      requests = await User.myRequests();
    } catch {
      requests = {};
    }

    this.setState({
      requests: requests,
      loaded: true,
    });
  }

  async getArchive() {
    let archive;
    const id = this.props.user.current.id;
    try {
      archive = await User.getArchive(id);
      archive.requests = archive.requests.reverse();
    } catch {
      archive = {};
    }

    this.setState({
      archive: archive,
    });
  }

  isToday(someDate) {
    someDate = someDate.setHours(0, 0, 0, 0);
    const today = new Date().setHours(0, 0, 0, 0);
    return someDate === today;
  }

  typeIcon(type) {
    let icon = null;
    switch (type) {
      case "movie":
        icon = <MovieIcon />;
        break;
      case "tv":
        icon = <TvIcon />;
        break;
      default:
        icon = null;
    }

    return <span className="table-icon">{icon}</span>;
  }

  render() {
    const localizer = momentLocalizer(moment);
    if (!this.state.loaded) {
      return (
        <div className="requests-page">
          <h1 className="main-title">Requests</h1>
          <div className="spinner">
            <Spinner />
          </div>
        </div>
      );
    }

    const MonthEvent = ({ event }) => {
      return (
        <div className="calendar--event--wrap">
          <div
            className={`calendar--event ${event.resource.hasFile ? "recorded" : ""
              } ${this.isToday(new Date(event.resource.airDateUtc))
                ? "airsToday"
                : ""
              } ${new Date(event.resource.airDateUtc) < new Date() ? "hasAired" : ""
              }`}
          >
            <div className="calendar--event--icon">
              {event.resource.series ? <TvIcon /> : <MovieIcon />}
            </div>
            <p>{event.title}</p>
          </div>
        </div>
      );
    };

    return (
      <div className="requests-page">
        <h1 className="main-title mb--1">Requests</h1>
        <div className="request-section">
          <section>
            <h3 className="sub-title mb--1">Your Requests</h3>
            <p>
              Track the progress of your requests. See the legend below to
              understand the current status of your requests.
            </p>
            <div className="requests-legend">
              <p>
                <span className="request-status pending">Pending</span> - Your
                request is pending approval
              </p>
              <p>
                <span className="request-status manual">No Status</span> - This
                means the request cannot be tracked by Petio
              </p>
              <p>
                <span className="request-status bad">Unavailable</span> -
                Currently this item cannot be downloaded
              </p>
              <p>
                <span className="request-status orange">Downloading</span> -
                Your request is currently downloading
              </p>
              <p>
                <span className="request-status good">Downloaded</span> - The
                item has been downloaded but is waiting for Plex to import
              </p>
              <p>
                <span className="request-status blue">~1 m 2 d</span> /{" "}
                <span className="request-status cinema">In Cinemas</span> - Not
                yet released, the approximate time to release (Years, Months,
                Days) or still in cinemas.
              </p>
            </div>
            <MyRequests requests={this.state.requests} msg={this.props.msg} />
          </section>
        </div>
        <section className="request-guide">
          <h3 className="sub-title mb--1">Guide</h3>
          <p>Upcoming TV airings and Movie releases.</p>
          {this.state.calendarData ? (
            <Calendar
              localizer={localizer}
              events={this.state.calendarData}
              startAccessor="start"
              endAccessor="end"
              components={{
                month: { event: MonthEvent },
                week: { event: MonthEvent },
              }}
              views={["month", "agenda"]}
            />
          ) : null}
        </section>
        <section className="request-archive">
          <h3 className="sub-title mb--1">Previous Requests</h3>
          <p>See your completed / failed requests</p>
          <table className="generic-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Approved</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {this.state.archive ? (
                this.state.archive.requests.map((req) => {
                  return (
                    <tr
                      key={req._id}
                      className={`generic-table--row--${req.removed ? "bad" : req.complete ? "good" : "normal"
                        }`}
                    >
                      <td>
                        <Link
                          to={`/${req.type === "movie" ? "movie" : "series"}/${req.tmdb_id
                            }`}
                        >
                          {req.title}
                        </Link>
                      </td>
                      <td>{this.typeIcon(req.type)}</td>
                      <td>{req.approved ? "Yes" : "No"}</td>
                      <td>
                        {req.removed
                          ? "Removed"
                          : req.complete
                            ? "Completed"
                            : "other"}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="4">Empty</td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </div>
    );
  }
}

Requests = withRouter(Requests);

function RequestsContainer(props) {
  return <Requests api={props.api} user={props.user} />;
}

const mapStateToProps = function (state) {
  return {
    api: state.api,
    user: state.user,
  };
};

export default connect(mapStateToProps)(RequestsContainer);
