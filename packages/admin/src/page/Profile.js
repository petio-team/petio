import React from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";

class Profile extends React.Component {
  componentDidMount() {
    let page = document.querySelectorAll(".page-wrap")[0];
    page.scrollTop = 0;
    window.scrollTo(0, 0);
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
                      : 'url("/api/user/thumb/' +
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
        </section>
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
