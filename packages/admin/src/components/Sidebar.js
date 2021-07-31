import React from "react";
import { withRouter, Link } from "react-router-dom";
import { connect } from "react-redux";
import { ReactComponent as DashIcon } from "../assets/svg/dashboard.svg";
import { ReactComponent as PersonIcon } from "../assets/svg/people.svg";
import { ReactComponent as ReviewIcon } from "../assets/svg/star.svg";
import { ReactComponent as RequestIcon } from "../assets/svg/bookmark.svg";
import { ReactComponent as SettingsIcon } from "../assets/svg/settings.svg";
import { ReactComponent as AdminIcon } from "../assets/svg/admin.svg";
import { ReactComponent as IssueIcon } from "../assets/svg/issue.svg";
import pjson from "../../package.json";

class Sidebar extends React.Component {
  render() {
    let current = this.props.location.pathname;
    let user = this.props.user.current;
    return (
      <div className={`menu ${this.props.mobOpen ? "open" : ""}`}>
        <div className="menu--logo">
          <div className="logo">
            Pet<span>io</span>
          </div>
          <p className="menu--title">Admin Dashboard</p>
        </div>

        <div className="menu--items">
          <Link
            to="/user"
            className={
              "menu--item user-profile " +
              (current === "/user" || current.startsWith("/user/")
                ? "active"
                : "")
            }
            onClick={this.props.toggleMobMenu}
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
                        window.location.pathname
                          .replace("/admin/", "")
                          .replace(/\/$/, "") +
                        "/api/user/thumb/" +
                        user.id +
                        '")',
                }}
              ></div>
            </div>
          </Link>
          <Link
            to="/"
            className={"menu--item " + (current === "/" ? "active" : "")}
            onClick={this.props.toggleMobMenu}
          >
            <p>Dashboard</p>
            <div className="icon">
              <DashIcon />
            </div>
          </Link>
          <Link
            to="/requests"
            className={
              "menu--item " +
              (current === "/requests" || current.startsWith("/requests/")
                ? "active"
                : "")
            }
            onClick={this.props.toggleMobMenu}
          >
            <p>Requests</p>
            <div className="icon">
              <RequestIcon />
            </div>
          </Link>
          <Link
            to="/issues"
            className={
              "menu--item " +
              (current === "/issues" || current.startsWith("/issues/")
                ? "active"
                : "")
            }
            onClick={this.props.toggleMobMenu}
          >
            <p>Issues</p>
            <div className="icon">
              <IssueIcon />
            </div>
          </Link>
          <Link
            to="/reviews"
            className={
              "menu--item " +
              (current === "/reviews" || current.startsWith("/reviews/")
                ? "active"
                : "")
            }
            onClick={this.props.toggleMobMenu}
          >
            <p>Reviews</p>
            <div className="icon">
              <ReviewIcon />
            </div>
          </Link>
          <Link
            to="/users"
            className={
              "menu--item " +
              (current === "/users" || current.startsWith("/users/")
                ? "active"
                : "")
            }
            onClick={this.props.toggleMobMenu}
          >
            <p>Users</p>
            <div className="icon">
              <PersonIcon />
            </div>
          </Link>
          <Link
            to="/settings"
            className={
              "menu--item " +
              (current === "/settings" || current.startsWith("/settings/")
                ? "active"
                : "")
            }
            onClick={this.props.toggleMobMenu}
          >
            <p>Settings</p>
            <div className="icon">
              <SettingsIcon />
            </div>
          </Link>
          <a
            className="menu--item"
            href={`${window.location.protocol}//${
              window.location.host
            }${window.location.pathname.replace("/admin/", "")}`}
          >
            <p>Exit Admin</p>
            <div className="icon">
              <AdminIcon />
            </div>
          </a>
        </div>
        <p className="menu--version">version {pjson.version}</p>
      </div>
    );
  }
}

Sidebar = withRouter(Sidebar);

function SidebarContainer(props) {
  return (
    <Sidebar
      user={props.user}
      changeLogin={props.changeLogin}
      mobOpen={props.mobOpen}
      toggleMobMenu={props.toggleMobMenu}
    />
  );
}

const mapStateToProps = function (state) {
  return {
    user: state.user,
  };
};

export default connect(mapStateToProps)(SidebarContainer);
