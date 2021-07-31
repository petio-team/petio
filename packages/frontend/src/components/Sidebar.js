import React from "react";
import { withRouter, Link } from "react-router-dom";
import { connect } from "react-redux";
import { ReactComponent as SearchIcon } from "../assets/svg/search.svg";
import { ReactComponent as MovieIcon } from "../assets/svg/movie.svg";
import { ReactComponent as TvIcon } from "../assets/svg/tv.svg";
import { ReactComponent as PersonIcon } from "../assets/svg/people.svg";
import { ReactComponent as RequestIcon } from "../assets/svg/bookmark.svg";
import { ReactComponent as AdminIcon } from "../assets/svg/admin.svg";
import { ReactComponent as BackIcon } from "../assets/svg/back.svg";
import pjson from "../../package.json";

class Sidebar extends React.Component {
  constructor(props) {
    super(props);
    this.goBack = this.goBack.bind(this);
  }

  stripTrailingSlash(str) {
    if (str.substr(-1) === "/") {
      return str.substr(0, str.length - 1);
    }
    return str;
  }

  goBack() {
    this.props.history.goBack();
  }

  render() {
    let current = this.props.location.pathname;
    let user = this.props.user.current;
    return (
      <div className="sidebar--inner">
        <Link to="/" className="logo">
          <p className="logo-text" title="Petio">
            Pet<span>io</span>
          </p>
        </Link>
        {current === "/" || current.startsWith("/search/") ? null : (
          <div className="back-btn" onClick={this.goBack}>
            <BackIcon />
          </div>
        )}
        <Link to="/user" className={"sidebar--user-mob "}>
          <div className="icon">
            <div
              className="thumb"
              style={{
                backgroundImage:
                  process.env.NODE_ENV === "development"
                    ? 'url("http://localhost:7778/user/thumb/' + user.id + '")'
                    : 'url("' +
                      this.props.user.credentials.api +
                      "/user/thumb/" +
                      user.id +
                      '")',
              }}
            ></div>
          </div>
        </Link>
        <div className="sidebar--scroll">
          <Link
            to="/user"
            className={
              "sidebar--item user-profile " +
              (current === "/user" || current.startsWith("/user/")
                ? "active"
                : "")
            }
          >
            <p>{user.title}</p>
            <div className="icon">
              <div
                className="thumb"
                style={{
                  backgroundImage:
                    process.env.NODE_ENV === "development"
                      ? 'url("http://localhost:7778/user/thumb/' +
                        user.id +
                        '")'
                      : 'url("' +
                        this.props.user.credentials.api +
                        "/user/thumb/" +
                        user.id +
                        '")',
                }}
              ></div>
            </div>
          </Link>
          <Link
            to="/"
            className={
              "sidebar--item " +
              (current === "/" || current.startsWith("/search/")
                ? "active"
                : "")
            }
          >
            <p>Search</p>
            <div className="icon">
              <SearchIcon />
            </div>
          </Link>
          <Link
            to="/movies"
            className={
              "sidebar--item " +
              (current === "/movies" || current.startsWith("/movie/")
                ? "active"
                : "")
            }
          >
            <p>Movies</p>
            <div className="icon">
              <MovieIcon />
            </div>
          </Link>
          <Link
            to="/tv"
            className={
              "sidebar--item " +
              (current === "/tv" || current.startsWith("/series/")
                ? "active"
                : "")
            }
          >
            <p>TV Shows</p>
            <div className="icon">
              <TvIcon />
            </div>
          </Link>
          <Link
            to="/people"
            className={
              "sidebar--item " +
              (current === "/people" || current.startsWith("/person/")
                ? "active"
                : "")
            }
          >
            <p>People</p>
            <div className="icon">
              <PersonIcon />
            </div>
          </Link>
          <Link
            to="/requests"
            className={
              "sidebar--item " +
              (current === "/requests" || current.startsWith("/requests/")
                ? "active"
                : "")
            }
          >
            <p>Requests</p>
            <div className="icon">
              <RequestIcon />
            </div>
          </Link>
          {user.role === "admin" || user.role === "moderator" ? (
            <a
              className="sidebar--item"
              href={`${window.location.protocol}//${window.location.host}${
                window.location.pathname === "/"
                  ? ""
                  : this.stripTrailingSlash(window.location.pathname)
              }/admin/`}
            >
              <p>Admin</p>
              <div className="icon">
                <AdminIcon />
              </div>
            </a>
          ) : null}
        </div>
        <p className="sidebar--version">version {pjson.version}</p>
      </div>
    );
  }
}

Sidebar = withRouter(Sidebar);

function SidebarContainer(props) {
  return <Sidebar api={props.api} user={props.user} />;
}

const mapStateToProps = function (state) {
  return {
    api: state.api,
    user: state.user,
  };
};

export default connect(mapStateToProps)(SidebarContainer);
