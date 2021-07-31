import React from "react";
import Api from "../data/Api";
import { ReactComponent as MovieIcon } from "../assets/svg/movie.svg";
import { ReactComponent as TvIcon } from "../assets/svg/tv.svg";
import Modal from "../components/Modal";

class Issues extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      issues: false,
      resolveIssueOpen: false,
      activeIssue: false,
      resolve_issue_comment: "",
      issuesLoaded: false,
    };

    this.getIssues = this.getIssues.bind(this);
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.setActive = this.setActive.bind(this);
    this.inputChange = this.inputChange.bind(this);
    this.removeIssue = this.removeIssue.bind(this);
  }

  componentDidMount() {
    this.getIssues();
  }

  openModal(id) {
    this.setState({
      [`${id}Open`]: true,
    });
  }

  closeModal(id) {
    this.setState({
      [`${id}Open`]: false,
      activeIssue: false,
      resolve_issue_comment: "",
    });
  }

  setActive(issue) {
    this.setState({
      activeIssue: issue,
    });
  }

  async getIssues() {
    let issues = await Api.getIssues();
    this.props.msg({ message: "Issues loaded" });
    this.setState({
      issues: issues,
      issuesLoaded: true,
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

  inputChange(e) {
    const target = e.target;
    const name = target.name;
    let value = target.type === "checkbox" ? target.checked : target.value;

    this.setState({
      [name]: value,
    });
  }

  async removeIssue() {
    let message = this.state.resolve_issue_comment;
    let remove = await Api.removeIssue(this.state.activeIssue._id, message);
    if (remove) {
      this.props.msg({
        message: `Issue Removed: ${this.state.activeIssue.title}`,
        type: "good",
      });
      this.closeModal("resolveIssue");
      this.getIssues();
    } else {
      this.props.msg({
        message: `Failed to Remove Issue: ${this.state.activeIssue.title}`,
        type: "error",
      });
    }
  }

  render() {
    return (
      <>
        <div className="issues--wrap">
          <Modal
            title="Resolve Issue"
            open={this.state.resolveIssueOpen}
            close={() => this.closeModal("resolveIssue")}
            submit={this.removeIssue}
          >
            <section>
              <p className="sub-title mb--1">
                {this.state.activeIssue ? this.state.activeIssue.title : null}
              </p>
              <p style={{ margin: 0 }}>
                {this.state.activeIssue
                  ? this.formatIssue(this.state.activeIssue.issue)
                  : null}
              </p>
              <p style={{ margin: 0 }}>
                <small>
                  {this.state.activeIssue ? this.state.activeIssue.comment : ""}
                </small>
              </p>
            </section>
            <p>Message to the user</p>
            <textarea
              className="styled-input--textarea"
              value={this.state.resolve_issue_comment}
              placeholder="Message to user: E.g This issue is fixed / could not be fixed"
              name="resolve_issue_comment"
              onChange={this.inputChange}
            ></textarea>
          </Modal>
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
                {this.state.issues && this.state.issues.length > 0 ? (
                  this.state.issues.map((issue) => {
                    return (
                      <tr key={issue._id}>
                        <td>{issue.title}</td>
                        <td>{this.typeIcon(issue.type)}</td>
                        <td>{this.formatIssue(issue.issue)}</td>
                        <td>{issue.comment}</td>
                        <td>{this.getUsername(issue.user)}</td>
                        <td>
                          <p
                            className="table-action"
                            onClick={() => {
                              this.openModal("resolveIssue");
                              this.setActive(issue);
                            }}
                          >
                            Resolve
                          </p>
                        </td>
                      </tr>
                    );
                  })
                ) : this.state.issuesLoaded ? (
                  <tr>
                    <td>No issues</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </section>
        </div>
      </>
    );
  }
}

export default Issues;
