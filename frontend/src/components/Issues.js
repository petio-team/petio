import React from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import User from "../data/User";

class Issues extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      id: false,
      open: this.props.open,
      type: "",
      option: "",
      detail: "",
    };

    this.inputChange = this.inputChange.bind(this);
    this.submit = this.submit.bind(this);
  }

  inputChange(e) {
    const target = e.target;
    const name = target.name;
    let value = target.value;

    this.setState({
      [name]: value,
    });
  }

  async submit() {
    if (!this.state.option) {
      this.props.msg({
        message: `Please pick an option`,
        type: "error",
      });
      return;
    }
    let id = this.state.id;
    let user = this.props.user.current.id;
    let type = this.state.type;
    let data = this.props.api[`${type}_lookup`][id];
    let title = false;
    if (data) {
      title = type === "movie" ? data.title : data.name;
    }
    console.log({
      mediaId: id,
      type: type,
      title: title,
      user: user,
      issue: this.state.option,
      comment: this.state.detail,
    });
    try {
      await User.addIssue({
        mediaId: id,
        type: type,
        title: title,
        user: user,
        issue: this.state.option,
        comment: this.state.detail,
      });
      this.setState({
        type: "",
        option: "",
        detail: "",
      });
      this.props.close();
      this.props.msg({
        message: `New Issue added`,
        type: "good",
      });
    } catch {
      this.props.msg({
        message: "Error adding issue, please try again later!",
        type: "error",
      });
    }
  }

  componentWillUnmount() {
    this.props.close();
  }

  componentDidUpdate() {
    if (this.state.id !== this.props.match.params.id) {
      let type;
      switch (this.props.match.path) {
        case "/movie/:id":
          type = "movie";
          break;
        case "/series/:id":
          type = "series";
          break;
        default:
          type = "unknown";
      }
      this.props.close();
      this.setState({
        id: this.props.match.params.id,
        type: type,
      });
    }

    if (this.props.open !== this.state.open) {
      this.setState({
        open: this.props.open,
      });
    }
  }

  render() {
    return (
      <div className={`issues--wrap ${this.state.open ? "active" : ""}`}>
        <div className="issues--inner">
          <div className="issues--top">
            <h3>Report an issue</h3>
          </div>
          <div className="issues--main">
            <section>
              <p style={{ margin: 0 }}>
                We try our best to provide good quality content without any
                problems, but sometimes things go wrong. Please use this form to
                let us know of any issues you&apos;ve had whilst watching Plex
                and we will do our best to fix them!
              </p>
            </section>
            <section>
              <p className="sub-title mb--1">Details</p>
              <p>
                Please fill out the fields below relating to the issue you are
                having with this show / movie.
              </p>
              <input
                type="hidden"
                name="id"
                defaultValue={this.state.id}
                readOnly
              />
              <input
                type="hidden"
                name="type"
                defaultValue={this.state.type}
                readOnly
              />
              <input
                type="hidden"
                name="user"
                value={this.props.user.current.id}
                readOnly
              />
              <div className="styled-input--select">
                <select
                  name="option"
                  value={this.state.option}
                  onChange={this.inputChange}
                >
                  <option value="">Choose an option</option>
                  {this.state.type === "movie" ? (
                    <>
                      <option value="subs">Missing Subtitles</option>
                      <option value="bad-video">
                        Bad Quality / Video Issue
                      </option>
                      <option value="bad-audio">
                        Audio Issue / Audio Sync
                      </option>
                    </>
                  ) : (
                    <>
                      <option value="episodes">Missing Episodes</option>
                      <option value="season">Missing Season</option>
                      <option value="subs">Missing Subtitles</option>
                      <option value="bad-video">
                        Bad Quality / Video Issue
                      </option>
                      <option value="bad-audio">
                        Audio Issue / Audio Sync
                      </option>
                    </>
                  )}
                  <option value="other">Other, please specify</option>
                </select>
              </div>
              <textarea
                className="styled-input--textarea"
                value={this.state.detail}
                placeholder="Notes"
                name="detail"
                onChange={this.inputChange}
              ></textarea>
            </section>
            <div className="btn btn__square bad" onClick={this.props.close}>
              Cancel
            </div>
            <div className="btn btn__square save-issue" onClick={this.submit}>
              Submit
            </div>
          </div>
        </div>
      </div>
    );
  }
}

Issues = withRouter(Issues);

function IssuesContainer(props) {
  return (
    <Issues
      api={props.api}
      user={props.user}
      close={props.close}
      open={props.open}
      msg={props.msg}
    />
  );
}

const mapStateToProps = function (state) {
  return {
    user: state.user,
    api: state.api,
  };
};

export default connect(mapStateToProps)(IssuesContainer);
