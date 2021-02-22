import React from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import Api from "../data/Api";
import RequestCard from "../components/RequestCard";
import Carousel from "../components/Carousel";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import { ReactComponent as MovieIcon } from "../assets/svg/movie.svg";
import { ReactComponent as TvIcon } from "../assets/svg/tv.svg";

class Requests extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      requests: false,
      loaded: false,
      calendar: false,
    };

    this.getRequests = this.getRequests.bind(this);
    this.getCalendar = this.getCalendar.bind(this);
  }

  componentDidMount() {
    let page = document.querySelectorAll(".page-wrap")[0];
    page.scrollTop = 0;
    window.scrollTo(0, 0);
    this.getRequests();
    this.getCalendar();
  }

  componentDidUpdate() {
    let requests = this.state.requests;
    if (!requests) {
      this.getRequests();
    }
  }

  async getCalendar() {
    try {
      let data = await Api.guideCalendar();
      this.setState({
        calendar: data,
      });
    } catch (err) {
      console.log(err);
    }
  }

  getRequests() {
    let requests = this.props.user.requests;
    if (!requests) return;
    this.setState({
      requests: true,
      loaded: true,
    });

    Object.keys(requests).map((key) => {
      let request = requests[key];
      if (request.type === "movie") {
        Api.movie(key);
      } else {
        Api.series(key);
      }
    });
  }

  isToday(someDate) {
    someDate = someDate.setHours(0, 0, 0, 0);
    const today = new Date().setHours(0, 0, 0, 0);
    return someDate === today;
  }

  render() {
    const localizer = momentLocalizer(moment);
    let calendarData = false;
    if (this.state.calendar) {
      calendarData = [];
      this.state.calendar.map((item) => {
        if (item.series) {
          let time = new Date(item.airDateUtc);
          calendarData.push({
            title: `${item.series.title} - s${item.seasonNumber.toLocaleString(
              "en-US",
              {
                minimumIntegerDigits: 2,
                useGrouping: false,
              }
            )}e${item.episodeNumber.toLocaleString("en-US", {
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
          calendarData.push({
            title: item.title,
            allDay: true,
            start: time,
            end: time,
            resource: item,
          });
        }
      });
    }
    if (!this.state.loaded) {
      return (
        <div className="requests-page">
          <h1 className="main-title">Requests</h1>
          <div className="request-section">
            <p className="sub-title">Loading...</p>
          </div>
        </div>
      );
    }
    let requests = this.props.user.requests;
    requests = this.props.user.requests;
    let yourRequests = Object.keys(requests).map((key) => {
      let request = this.props.api.movie_lookup[key];
      if (requests[key].type === "tv") {
        request = this.props.api.series_lookup[key];
      }
      let user = this.props.user.current.id;

      if (!request || !requests[key].users.includes(user)) return null;
      return <RequestCard key={key + "_your"} request={request} />;
    });

    const MonthEvent = ({ event }) => {
      return (
        <div className="calendar--event--wrap">
          <div
            className={`calendar--event ${
              event.resource.hasFile ? "recorded" : ""
            } ${
              this.isToday(new Date(event.resource.airDateUtc))
                ? "airsToday"
                : ""
            } ${
              new Date(event.resource.airDateUtc) < new Date() ? "hasAired" : ""
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
            <Carousel>{yourRequests}</Carousel>
          </section>
        </div>
        <section className="request-guide">
          <h3 className="sub-title mb--1">Guide</h3>
          <p>Upcoming TV airings and Movie releases.</p>
          {calendarData ? (
            <Calendar
              localizer={localizer}
              events={calendarData}
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
