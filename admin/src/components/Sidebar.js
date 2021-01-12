import React from "react";
import { withRouter, Link } from "react-router-dom";
import { connect } from "react-redux";
import { ReactComponent as DashIcon } from "../assets/svg/dashboard.svg";
import { ReactComponent as PersonIcon } from "../assets/svg/people.svg";
import { ReactComponent as ReviewIcon } from "../assets/svg/star.svg";
import { ReactComponent as RequestIcon } from "../assets/svg/bookmark.svg";
import { ReactComponent as SettingsIcon } from "../assets/svg/settings.svg";
import { ReactComponent as CloseIcon } from "../assets/svg/close.svg";
import { ReactComponent as AdminIcon } from "../assets/svg/admin.svg";
import User from "../data/User";
import pjson from "../../package.json";

class Sidebar extends React.Component {
  constructor(props) {
    super(props);

    this.logout = this.logout.bind(this);
  }
  logout() {
    User.logout();
    this.props.changeLogin(false);
  }
  render() {
    let current = this.props.location.pathname;
    let user = this.props.user.current;
    return (
      <div className="menu">
        <div className="menu--logo">
          <div className="logo">
            Pet<span>io</span>
          </div>
          <p className="menu--title">Admin Dashboard</p>
        </div>

        <div className="menu--items">
          <Link to="/user" className={"menu--item user-profile " + (current === "/user" || current.startsWith("/user/") ? "active" : "")}>
            <p>{user.title}</p>
            <div className="icon">
              <div
                className="thumb"
                style={{
                  backgroundImage: "url(" + user.thumb + ")",
                  color: "red",
                }}
              ></div>
            </div>
          </Link>
          <Link to="/" className={"menu--item " + (current === "/" ? "active" : "")}>
            <p>Dashboard</p>
            <div className="icon">
              <DashIcon />
            </div>
          </Link>
          <Link to="/requests" className={"menu--item " + (current === "/requests" || current.startsWith("/requests/") ? "active" : "")}>
            <p>Requests</p>
            <div className="icon">
              <RequestIcon />
            </div>
          </Link>
          <Link to="/reviews" className={"menu--item " + (current === "/reviews" || current.startsWith("/reviews/") ? "active" : "")}>
            <p>Reviews</p>
            <div className="icon">
              <ReviewIcon />
            </div>
          </Link>
          <Link to="/users" className={"menu--item " + (current === "/users" || current.startsWith("/users/") ? "active" : "")}>
            <p>Users</p>
            <div className="icon">
              <PersonIcon />
            </div>
          </Link>
          <Link to="/settings" className={"menu--item " + (current === "/settings" || current.startsWith("/settings/") ? "active" : "")}>
            <p>Settings</p>
            <div className="icon">
              <SettingsIcon />
            </div>
          </Link>
          <div className="menu--item logout" onClick={this.logout}>
            <p>Logout</p>
            <div className="icon">
              <CloseIcon />
            </div>
          </div>
          <a className="menu--item" href={`${window.location.protocol}//${window.location.host}${window.location.pathname.replace("/admin/", "")}`}>
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
  return <Sidebar user={props.user} changeLogin={props.changeLogin} />;
}

const mapStateToProps = function (state) {
  return {
    user: state.user,
  };
};

export default connect(mapStateToProps)(SidebarContainer);
