import React from "react";
import { ReactComponent as MovieIcon } from "../assets/svg/movie.svg";
import { ReactComponent as TvIcon } from "../assets/svg/tv.svg";
import { ReactComponent as Arrow } from "../assets/svg/arrow-left.svg";

class RequestsTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sortBy: "title",
      dir: "DESC",
    };

    this.sortBy = this.sortBy.bind(this);
    this.sortCol = this.sortCol.bind(this);
  }

  sortBy(a, b) {
    let sortVal = this.state.sortBy;
    if (a[sortVal].toLowerCase() > b[sortVal].toLowerCase()) {
      return this.state.dir === "DESC" ? 1 : -1;
    }
    if (a[sortVal].toLowerCase() < b[sortVal].toLowerCase()) {
      return this.state.dir === "DESC" ? -1 : 1;
    }
    return 0;
  }

  sortCol(type) {
    if (!type) return;
    let sw = this.state.sortBy === type ? true : false;
    let dir = sw ? (this.state.dir === "DESC" ? "ASC" : "DESC") : "DESC";
    this.setState({
      dir: dir,
      sortBy: type,
    });
  }

  getUsername(id) {
    if (!this.props.api.users) {
      return null;
    } else if (id in this.props.api.users) {
      return this.props.api.users[id].title;
    } else {
      return null;
    }
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

    return <span className="requests--icon">{icon}</span>;
  }

  calcDate(diff) {
    var day = 1000 * 60 * 60 * 24;

    var days = Math.ceil(diff / day);
    var months = Math.floor(days / 31);
    var years = Math.floor(months / 12);
    days = days - months * 31;
    months = months - years * 12;

    var message = "";
    message += years ? years + " yr " : "";
    message += months ? months + " m " : "";
    message += days ? days + " d " : "";

    return message;
  }

  cinemaWindow(diff) {
    var day = 1000 * 60 * 60 * 24;
    var days = Math.ceil(diff / day);
    if (days >= 62) {
      return false;
    }
    return true;
  }

  getYear(req) {
    if (req.media)
      if (Object.keys(req.media).length > 0) {
        if (req.type === "movie") {
          return req.media.release_date
            ? new Date(req.media.release_date).getFullYear()
            : null;
        } else {
          return req.media.first_air_date
            ? new Date(req.media.first_air_date).getFullYear()
            : null;
        }
      } else {
        return null;
      }
    return null;
  }

  children(req) {
    if (!req.children) {
      return null;
    }
    if (req.children.length === 0) {
      return null;
    }
    let render = [];
    req.children.map((server) => {
      let type = req.type;

      // let prog = (child.sizeleft / child.size - 1) * -1 * 100;
      if (server.status.length > 0) {
        render.push(
          server.status.map((child, row) => {
            if (!child) {
              console.log(req);
              return null;
            }

            let prog = (child.sizeleft / child.size - 1) * -1 * 100;
            return (
              <>
                {row === 0 ? (
                  <tr className="sub">
                    <td colSpan="7">
                      <p>Server: {server.info.serverName}</p>
                    </td>
                  </tr>
                ) : null}
                <tr className="child">
                  <td>
                    {type === "tv" ? (
                      <p>
                        Series: {child.episode.seasonNumber} Episode:{" "}
                        {child.episode.episodeNumber}
                      </p>
                    ) : null}
                    {type === "movie" ? <p>Movie</p> : null}
                  </td>
                  <td></td>
                  <td>
                    <span className="requests--quality">
                      {child.quality.quality.name}
                    </span>
                  </td>
                  <td>
                    {" "}
                    <div className="requests--prog--wrap">
                      <div className="requests--prog">
                        <span
                          className="requests--prog--active"
                          style={{
                            width: prog + "%",
                          }}
                        ></span>
                      </div>

                      {(child.status !== "Downloading" &&
                        child.status !== "downloading") ||
                      !child.timeleft ? (
                        <p>
                          <strong className="capitalise">{child.status}</strong>
                        </p>
                      ) : (
                        <p>
                          Time left <strong>{child.timeleft}</strong>
                        </p>
                      )}
                    </div>
                  </td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
              </>
            );
          })
        );
      } else {
        return null;
      }
    });
    return render;
  }

  reqState(req) {
    let diff;
    if (!req.approved) {
      return (
        <span className="requests--status requests--status__pending">
          Pending
        </span>
      );
    }
    if (req.children) {
      if (req.children.length > 0) {
        for (let r = 0; r < req.children.length; r++) {
          if (req.children[r].status.length > 0) {
            return (
              <span className="requests--status requests--status__orange">
                Downloading
              </span>
            );
          }

          if (
            req.children[r].info.downloaded ||
            req.children[r].info.movieFile
          ) {
            return (
              <span className="requests--status requests--status__good">
                Downloaded
              </span>
            );
          }

          if (req.children[r].info.message === "NotFound") {
            return (
              <span className="requests--status requests--status__bad">
                Removed
              </span>
            );
          }

          if (req.type === "tv" && req.children[r].info) {
            if (
              req.children[r].info.episodeCount ===
                req.children[r].info.episodeFileCount &&
              req.children[r].info.episodeCount > 0
            ) {
              return (
                <span className="requests--status requests--status__good">
                  Downloaded
                </span>
              );
            }

            if (req.children[r].info.seasons) {
              let missing = false;
              for (let season of req.children[r].info.seasons) {
                if (season.statistics.percentOfEpisodes !== 100) missing = true;
              }

              if (!missing) {
                return (
                  <span className="requests--status requests--status__good">
                    Downloaded
                  </span>
                );
              } else {
                let airDate = req.children[r].info.firstAired;
                diff = Math.ceil(new Date(airDate) - new Date());
                if (diff > 0) {
                  return (
                    <span className="requests--status requests--status__blue">
                      ~{this.calcDate(diff)}
                    </span>
                  );
                } else {
                  if (req.children[r].info.episodeFileCount > 0) {
                    return (
                      <span className="requests--status requests--status__blue">
                        Partially Downloaded
                      </span>
                    );
                  }
                  return (
                    <span className="requests--status requests--status__bad">
                      Unavailable
                    </span>
                  );
                }
              }
            }
          }

          if (req.type === "movie" && req.children[r].info) {
            if (
              req.children[r].info.inCinemas ||
              req.children[r].info.digitalRelease
            ) {
              if (req.children[r].info.inCinemas) {
                diff = Math.ceil(
                  new Date(req.children[r].info.inCinemas) - new Date()
                );
                if (diff > 0) {
                  return (
                    <span className="requests--status requests--status__blue">
                      ~{this.calcDate(diff)}
                    </span>
                  );
                }
              }
              if (req.children[r].info.digitalRelease) {
                let digitalDate = new Date(req.children[r].info.digitalRelease);
                if (new Date() - digitalDate < 0) {
                  return (
                    <span className="requests--status requests--status__cinema">
                      In Cinemas
                    </span>
                  );
                } else {
                  return (
                    <span className="requests--status requests--status__bad">
                      Unavailable
                    </span>
                  );
                }
              } else {
                if (req.children[r].info.inCinemas) {
                  diff = Math.ceil(
                    new Date() - new Date(req.children[r].info.inCinemas)
                  );
                  if (this.cinemaWindow(diff)) {
                    return (
                      <span className="requests--status requests--status__cinema">
                        In Cinemas
                      </span>
                    );
                  }
                }
                return (
                  <span className="requests--status requests--status__bad">
                    Unavailable
                  </span>
                );
              }
            }
          }
        }
      }
    }

    return (
      <span className="requests--status requests--status__manual">
        No status
      </span>
    );
  }

  render() {
    let requestsUnsorted = Object.values(this.props.requests);
    let requestsSorted = requestsUnsorted.sort(this.sortBy);

    return (
      <table className="generic-table generic-table__rounded">
        <thead>
          <tr>
            <th
              className={`fixed sortable ${
                this.state.sortBy === "title" ? "active" : ""
              } ${this.state.dir}`}
              onClick={() => this.sortCol("title")}
            >
              Title
              <Arrow />
            </th>
            <th>Year</th>
            <th>Type</th>
            <th>Status</th>
            <th>Users</th>
            <th>Approved</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(requestsSorted).length === 0 ? (
            <tr>
              <td>No requests</td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
          ) : (
            Object.keys(requestsSorted).map((key) => {
              let req = requestsSorted[key];

              return (
                <React.Fragment key={key}>
                  <tr>
                    <td>{req.title}</td>
                    <td>{this.getYear(req)}</td>
                    <td>{this.typeIcon(req.type)}</td>
                    <td>
                      {this.reqState(req)}
                      {req.sonarrId.length > 0 ? (
                        <span className="requests--status requests--status__sonarr">
                          Sonarr
                        </span>
                      ) : null}
                      {req.radarrId.length > 0 ? (
                        <span className="requests--status requests--status__radarr">
                          Radarr
                        </span>
                      ) : null}
                    </td>
                    <td>
                      {req.users.map((user, i) => {
                        return (
                          <p key={`${req.id}_${user}_${i}`}>
                            {this.getUsername(user)}
                          </p>
                        );
                      })}
                    </td>
                    <td>{req.approved ? "Yes" : "No"}</td>
                    <td>
                      <p
                        className="table-action"
                        onClick={() => {
                          this.props.editReq(req);
                        }}
                      >
                        Edit
                      </p>
                    </td>
                  </tr>
                  {this.children(req)}
                </React.Fragment>
              );
            })
          )}
        </tbody>
      </table>
    );
  }
}

export default RequestsTable;
