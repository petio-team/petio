import React from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import History from "../components/History";
import User from "../data/User";

class Profile extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      quota: false,
    };

    this.getQuota = this.getQuota.bind(this);
  }
  componentDidMount() {
    let page = document.querySelectorAll(".page-wrap")[0];
    page.scrollTop = 0;
    window.scrollTo(0, 0);
    this.getQuota();
  }

  async getQuota() {
    try {
      let quota = await User.quota();
      this.setState({
        quota: quota,
      });
      this.props.msg({
        type: "info",
        message: "Quotas loaded",
      });
    } catch (err) {
      this.setState({
        quota: {
          current: "error",
          total: "error",
        },
      });
      this.props.msg({
        type: "error",
        message: "Failed to load quota",
      });
    }
  }

  formatQuota() {
    if (!this.state.quota) {
      return "Loading...";
    }
    if (this.state.quota.current === "error") {
      return "Error";
    } else {
      let current = this.state.quota.current;
      let total = this.state.quota.total > 0 ? this.state.quota.total : "∞";
      return `${current} / ${total} - per week`;
    }
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
                  backgroundImage:
                    process.env.NODE_ENV === "development"
                      ? 'url("http://localhost:7778/user/thumb/' +
                        this.props.user.current.id +
                        '")'
                      : 'url("' +
                        this.props.user.credentials.api +
                        "/user/thumb/" +
                        this.props.user.current.id +
                        '")',
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
              <p className="role">{this.props.user.current.role}</p>
            </div>

            <div className="profile-logout">
              <p className="logout sub-title" onClick={this.props.logout}>
                Logout
              </p>
            </div>
          </div>
          <div className="profile-quota profile-block">
            <h3 style={{ marginBottom: "0" }} className="sub-title">
              Your Request Quota
            </h3>
            <small style={{ marginBottom: "5px", display: "block" }}>
              Request quotas reset every Sunday night
            </small>
            <p style={{ marginBottom: "0" }}>
              <strong>{this.formatQuota()}</strong>
            </p>
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
  return <Profile user={props.user} logout={props.logout} msg={props.msg} />;
}

const mapStateToProps = function (state) {
  return {
    user: state.user,
  };
};

export default connect(mapStateToProps)(ProfileContainer);
