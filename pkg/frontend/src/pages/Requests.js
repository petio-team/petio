import moment from 'moment';
import React from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';

import { ReactComponent as MovieIcon } from '../assets/svg/movie.svg';
import { ReactComponent as Spinner } from '../assets/svg/spinner.svg';
import { ReactComponent as TvIcon } from '../assets/svg/tv.svg';
import MyRequests from '../components/MyRequests';
import Api from '../data/Api';
import User from '../data/User';

class Requests extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      requests: {},
      archive: {},
      loaded: false,
      calendarData: [],
    };

    this.getCalendarData = this.getCalendarData.bind(this);
    this.typeIcon = this.typeIcon.bind(this);
  }

  async componentDidMount() {
    let page = document.querySelectorAll('.page-wrap')[0];
    page.scrollTop = 0;
    window.scrollTo(0, 0);

    const [requests, calendar, archive] = await Promise.all([
      User.myRequests(),
      Api.guideCalendar(),
      User.getArchive(this.props.user.current.id),
    ]);

    this.setState({
      requests,
      archive: {
        ...archive,
        requests: archive.requests.reverse(),
      },
      calendarData: this.getCalendarData(calendar.data),
      loaded: true,
    });
  }

  getCalendarData(calendar) {
    let calendarData = calendar.map((item) => {
      if (item.show) {
        let time = new Date(item.airDate);
        const data = {
          title: `${item.title} - S${item.show.seasonNumber.toLocaleString(
            'en-US',
            {
              minimumIntegerDigits: 2,
              useGrouping: false,
            },
          )}E${item.show.episodeNumber.toLocaleString('en-US', {
            minimumIntegerDigits: 2,
            useGrouping: false,
          })}`,
          allDay: false,
          start: time,
          end: time,
          resource: item,
        };
        return data;
      } else {
        let time = new Date(item.airDate);
        return {
          title: item.title,
          allDay: true,
          start: time,
          end: time,
          resource: item,
        };
      }
    });

    return calendarData;
  }

  isToday(someDate) {
    someDate = someDate.setHours(0, 0, 0, 0);
    const today = new Date().setHours(0, 0, 0, 0);
    return someDate === today;
  }

  typeIcon(type) {
    let icon = null;
    switch (type) {
      case 'movie':
        icon = <MovieIcon />;
        break;
      case 'tv':
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
      const airDate = event.resource.tvdbid ? event.resource.airDate : event.resource.airDateUtc;
      return (
        <div className="calendar--event--wrap">
          <div
            className={`calendar--event ${
              event.resource.hasFile ? 'recorded' : ''
            } ${
              this.isToday(new Date(airDate))
                ? 'airsToday'
                : ''
            } ${
              new Date(airDate) < new Date() ? 'hasAired' : ''
            }`}
          >
            <div className="calendar--event--icon">
              {event.resource.tvdbid ? <TvIcon /> : <MovieIcon />}
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
                <span className="request-status blue">~1 m 2 d</span> /{' '}
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
              views={['month', 'agenda']}
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
                      className={`generic-table--row--${
                        req.removed ? 'bad' : req.complete ? 'good' : 'normal'
                      }`}
                    >
                      <td>
                        <Link
                          to={`/${req.type === 'movie' ? 'movie' : 'series'}/${
                            req.tmdb_id
                          }`}
                        >
                          {req.title}
                        </Link>
                      </td>
                      <td>{this.typeIcon(req.type)}</td>
                      <td>{req.approved ? 'Yes' : 'No'}</td>
                      <td>
                        {req.removed
                          ? 'Removed'
                          : req.complete
                          ? 'Completed'
                          : 'other'}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4}>Empty</td>
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
