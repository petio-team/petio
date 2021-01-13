import React from "react";
import { withRouter, Link } from "react-router-dom";
import { connect } from "react-redux";

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

  submit() {
    console.log({
      user: this.state.user,
      item_id: this.state.id,
      type: this.state.type,
      issue: this.state.option,
      detail: this.state.detail,
    });
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
      <div className={`issue-sidebar ${this.state.open ? "open" : ""}`}>
        <button className="issue-sidebar--close" onClick={this.props.close}></button>
        <p className="main-title mb--2">Report an issue</p>
        <section>
          <p>
            We try our best to provide good quality content without any problems, but sometimes things go wrong. Please use this form to let us know of any issues you've had whilst watching Plex and
            we will do our best to fix them!
          </p>
        </section>
        <section>
          <p className="sub-title mb--1">Details</p>
          <input type="hidden" name="id" defaultValue={this.state.id} readOnly />
          <input type="hidden" name="type" defaultValue={this.state.type} readOnly />
          <input type="hidden" name="user" value={this.props.user.current.id} readOnly />
          <select name="option" onChange={this.inputChange}>
            <option value="">Choose an option</option>
            {this.state.type === "movie" ? (
              <>
                <option value="subs">Missing Subtitles</option>
                <option value="bad-video">Bad Quality / Video Issue</option>
                <option value="bad-audio">Audio Issue / Audio Sync</option>
              </>
            ) : (
              <>
                <option value="episodes">Missing Episodes</option>
                <option value="subs">Missing Subtitles</option>
                <option value="bad-video">Bad Quality / Video Issue</option>
                <option value="bad-audio">Audio Issue / Audio Sync</option>
              </>
            )}
            <option value="other">Other, please specify</option>
          </select>
          <textarea placeholder="Notes" name="detail" onChange={this.inputChange}></textarea>
        </section>
        <button className="btn btn__square" onClick={this.submit}>
          Submit
        </button>
      </div>
    );
  }
}

Issues = withRouter(Issues);

function IssuesContainer(props) {
  return <Issues user={props.user} close={props.close} open={props.open} />;
}

const mapStateToProps = function (state) {
  return {
    user: state.user,
  };
};

export default connect(mapStateToProps)(IssuesContainer);
