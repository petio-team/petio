import React from "react";
import Api from "../data/Api";
import { ReactComponent as MovieIcon } from "../assets/svg/movie.svg";
import { ReactComponent as TvIcon } from "../assets/svg/tv.svg";
// import Modal from "../components/Modal";

class Issues extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      issues: false,
    };

    this.getIssues = this.getIssues.bind(this);
  }

  componentDidMount() {
    this.getIssues();
  }

  async getIssues() {
    let issues = await Api.getIssues();
    this.setState({
      issues: issues,
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

  formatIssue(issue) {
    switch (issue) {
      case "episodes":
        return "Missing Episodes";
      case "season":
        return "Missing Season";
      case "subs":
        return "Missing / Wrong Subtitles";
      case "bad-video":
        return "Bad Quality / Video Issue";
      case "bad-audio":
        return "Audio Issue / Audio Sync";
      default:
        return "Not Specified";
    }
  }

  typeIcon(type) {
    let icon = null;
    switch (type) {
      case "movie":
        icon = <MovieIcon />;
        break;
      case "tv":
      case "series":
        icon = <TvIcon />;
        break;
      default:
        icon = null;
    }

    return <span className="requests--icon">{icon}</span>;
  }

  render() {
    return (
      <>
        <div className="issues--wrap">
          <section>
            <p className="main-title">Issues</p>
          </section>
          <section>
            <table className="generic-table generic-table__rounded">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Issue</th>
                  <th>Info</th>
                  <th>User</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {this.state.issues
                  ? this.state.issues.map((issue) => {
                      return (
                        <tr key={issue._id}>
                          <td>{issue.title}</td>
                          <td>{this.typeIcon(issue.type)}</td>
                          <td>{this.formatIssue(issue.issue)}</td>
                          <td>{issue.comment}</td>
                          <td>{this.getUsername(issue.user)}</td>
                          <td></td>
                        </tr>
                      );
                    })
                  : null}
              </tbody>
            </table>
          </section>
        </div>
      </>
    );
  }
}

export default Issues;
