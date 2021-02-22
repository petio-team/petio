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
        <div
          className={`modal-4k-request ${this.state.open4kmodal ? "open" : ""}`}
        >
          <div className="modal-4k-request--top">
            <h3>Request 4K / UHD Access</h3>
          </div>
          <div className="modal-4k-request--content">
            <p>
              Access to 4K / UHD content is limited to users who have both the
              internet speed and devices to watch 4K without buffering or the
              server trying to convert down to a lower resolution.
            </p>
            <p>
              Before processing your request make sure your device can play HEVC
              (aka h.265) and your internet speed is above 50mbps. Check your TV
              / device manual for information on video codecs and perform a
              speed test below.
            </p>
            <div className="modal-4k-request--speed">
              <iframe src="https://www.metercustom.net/plugin/" />
            </div>
            <p>Passed both criteria? Click below to request access.</p>
            <div
              className="btn btn__square bad modal-4k-request--cancel"
              onClick={this.close4k}
            >
              Cancel
            </div>
            <button className="modal-4k-request--submit btn btn__square">
              Request Access
            </button>
          </div>
        </div>
        <h1 className="main-title mb--2">Your Account</h1>
        <section>
          <div className="profile-overview">
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
