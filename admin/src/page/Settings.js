import React from "react";
import { connect } from "react-redux";
import { withRouter, Link, Switch, Route } from "react-router-dom";

import { ReactComponent as GeneralIcon } from "../assets/svg/settings-general.svg";
import General from "./settings/general";
import Radarr from "./settings/radarr";
import Sonarr from "./settings/sonarr";

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
          <Link to="/settings" className={"settings--menu--item " + (current === "/settings" ? "active" : "")}>
            <p>General</p>
            <div className="icon">
              <GeneralIcon />
            </div>
          </Link>
          <Link to="/settings/sonarr" className={"settings--menu--item " + (current === "/settings/sonarr" ? "active" : "")}>
            <p>Sonarr</p>
            <div className="icon">
              <img className="" src="https://raw.githubusercontent.com/Sonarr/Sonarr/phantom-develop/Logo/256.png" />
            </div>
          </Link>
          <Link to="/settings/radarr" className={"settings--menu--item " + (current === "/settings/radarr" ? "active" : "")}>
            <p>Radarr</p>
            <div className="icon">
              <img className="png-safe" src="https://avatars1.githubusercontent.com/u/25025331" />
            </div>
          </Link>
        </div>
        <div className="settings--content">
          <Switch>
            <Route exact path="/settings">
              <General />
            </Route>
            <Route path="/settings/sonarr">
              <Sonarr />
            </Route>
            <Route path="/settings/radarr">
              <Radarr />
            </Route>
          </Switch>
        </div>
      </div>
    );
  }
}

Settings = withRouter(Settings);

function SettingsContainer(props) {
  return <Settings plex={props.plex} api={props.api} user={props.user} checkConfig={props.checkConfig} />;
}

const mapStateToProps = function (state) {
  return {
    plex: state.plex,
    api: state.api,
    user: state.user,
  };
};

export default connect(mapStateToProps)(SettingsContainer);
