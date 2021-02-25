import React from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import History from "../components/History";

class Profile extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      open4kmodal: false,
    };

    this.open4k = this.open4k.bind(this);
    this.close4k = this.close4k.bind(this);
  }
  componentDidMount() {
    let page = document.querySelectorAll(".page-wrap")[0];
    page.scrollTop = 0;
    window.scrollTo(0, 0);
  }

  open4k() {
    this.setState({
      open4kmodal: true,
    });
  }

  close4k() {
    this.setState({
      open4kmodal: false,
    });
  }

  render() {
    return (
      <div className="profile-page">
        <h1 className="main-title mb--2">Your Account</h1>
        <section>
          <div className="profile-overview profile-block">
            <div className="profile-thumb">
              <a
                href="https://app.plex.tv/desktop#!/settings/account"
                target="_blank"
                rel="noreferrer"
                className="thumb"
                style={{
                  backgroundImage: "url(" + this.props.user.current.thumb + ")",
                  color: "red",
                }}
              ></a>
              <div className="hover">
                <p>Change</p>
              </div>
            </div>
            <div className="profile-info">
              <h3 className="sub-title">{this.props.user.current.username}</h3>
              <p className="email">{this.props.user.current.email}</p>
              <p className="role">
                {this.props.user.current.admin ? "Admin" : "Friend"}
              </p>
            </div>

            <div className="profile-logout">
              <p className="logout sub-title" onClick={this.props.logout}>
                Logout
              </p>
            </div>
          </div>
        </section>
        <History type="movie" />
        <History type="show" />
      </div>
    );
  }
}

Profile = withRouter(Profile);

function ProfileContainer(props) {
  return <Profile user={props.user} logout={props.logout} />;
}

const mapStateToProps = function (state) {
  return {
    user: state.user,
  };
};

export default connect(mapStateToProps)(ProfileContainer);
