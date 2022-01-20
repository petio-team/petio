import React from "react";
import { connect } from "react-redux";
import { withRouter, Link, Switch, Route } from "react-router-dom";

import { ReactComponent as GeneralIcon } from "../assets/svg/settings-general.svg";
import { ReactComponent as ConsoleIcon } from "../assets/svg/console.svg";
import { ReactComponent as FilterIcon } from "../assets/svg/filter.svg";
import { ReactComponent as NotificationsIcon } from "../assets/svg/notifications.svg";
import Console from "./settings/console";
import General from "./settings/general";
import Radarr from "./settings/radarr";
import Sonarr from "./settings/sonarr";
import Filter from "./settings/filter";
import Notifications from "./settings/notifications";

class Settings extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      parent: "general",
      child: "",
    };
  }

  componentDidMount() {
    let page = document.querySelectorAll(".page-wrap")[0];
    page.scrollTop = 0;
    window.scrollTo(0, 0);
  }

  render() {
    let current = this.props.location.pathname;
    return (
      <div className="settings--wrap">
        <div className="settings--menu">
          <Link
            to="/settings"
            className={
              "settings--menu--item " +
              (current === "/settings" ? "active" : "")
            }
          >
            <p>General</p>
            <div className="icon">
              <GeneralIcon />
            </div>
          </Link>
          <Link
            to="/settings/radarr"
            className={
              "settings--menu--item " +
              (current === "/settings/radarr" ? "active" : "")
            }
          >
            <p>Radarr</p>
            <div className="icon">
              <img
                className=""
                src="https://avatars1.githubusercontent.com/u/25025331"
              />
            </div>
          </Link>
          <Link
            to="/settings/sonarr"
            className={
              "settings--menu--item " +
              (current === "/settings/sonarr" ? "active" : "")
            }
          >
            <p>Sonarr</p>
            <div className="icon">
              <img
                className=""
                src="https://raw.githubusercontent.com/Sonarr/Sonarr/phantom-develop/Logo/256.png"
              />
            </div>
          </Link>
          <Link
            to="/settings/filter"
            className={
              "settings--menu--item " +
              (current === "/settings/filter" ? "active" : "")
            }
          >
            <p>Filter</p>
            <div className="icon">
              <FilterIcon />
            </div>
          </Link>
          <Link
            to="/settings/notifications"
            className={
              "settings--menu--item " +
              (current === "/settings/notifications" ? "active" : "")
            }
          >
            <p>Notifications</p>
            <div className="icon">
              <NotificationsIcon />
            </div>
          </Link>
          <Link
            to="/settings/console"
            className={
              "settings--menu--item " +
              (current === "/settings/console" ? "active" : "")
            }
          >
            <p>Console</p>
            <div className="icon">
              <ConsoleIcon />
            </div>
          </Link>
        </div>
        <div className="settings--content">
          <Switch>
            <Route exact path="/settings">
              <General msg={this.props.msg} plex={this.props.plex} />
            </Route>
            <Route path="/settings/radarr">
              <Radarr msg={this.props.msg} />
            </Route>
            <Route path="/settings/sonarr">
              <Sonarr msg={this.props.msg} />
            </Route>
            <Route path="/settings/filter">
              <Filter msg={this.props.msg} />
            </Route>
            <Route path="/settings/notifications">
              <Notifications msg={this.props.msg} />
            </Route>
            <Route path="/settings/console">
              <Console msg={this.props.msg} />
            </Route>
            <Route path="*" exact>
              <section>
                <h1 className="main-title mb--1">Not found</h1>
                <p>This page doesn&apos;t exist</p>
              </section>
            </Route>
          </Switch>
        </div>
      </div>
    );
  }
}

Settings = withRouter(Settings);

function SettingsContainer(props) {
  return (
    <Settings
      plex={props.plex}
      api={props.api}
      user={props.user}
      checkConfig={props.checkConfig}
      msg={props.msg}
    />
  );
}

const mapStateToProps = function (state) {
  return {
    plex: state.plex,
    api: state.api,
    user: state.user,
  };
};

export default connect(mapStateToProps)(SettingsContainer);
