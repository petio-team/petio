import React from "react";
import Api from "../data/Api";
import User from "../data/User";
import { ReactComponent as Spinner } from "../assets/svg/spinner.svg";
import RequestsTable from "../components/RequestsTable";

class Requests extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      requests: this.props.user.requests,
      pending: false,
      users: {},
    };

    this.getRequests = this.getRequests.bind(this);
  }

  componentDidMount() {
    this.getRequests(true);
    this.heartbeat = setInterval(() => this.getRequests(true), 30000);

    let page = document.querySelectorAll(".page-wrap")[0];
    page.scrollTop = 0;
    window.scrollTo(0, 0);
  }

  componentDidUpdate() {
    if (this.props.user.requests !== this.state.requests) {
      this.setState({
        requests: this.props.user.requests,
      });
    }
    if (Object.keys(this.state.requests).length > 0)
      Object.keys(this.state.requests).map((key) => {
        let req = this.state.requests[key];
        for (let i = 0; i < req.users.length; i++) {
          if (!this.props.api.users[req.users[i]]) {
            console.log(req.users[i]);
            Api.getUser(req.users[i]);
          }
        }
      });
  }

  componentWillUnmount() {
    clearInterval(this.heartbeat);
  }

  getRequests(live = false) {
    if (!this.state.requests || live) {
      User.getRequests();
    }
  }

  render() {
    return (
      <div className="requests--wrap">
        {this.state.pending ? (
          <div className="spinner--requests">
            <Spinner />
          </div>
        ) : (
          <>
            <section>
              <p className="main-title">Requests</p>
            </section>
            <section>
              <RequestsTable requests={this.state.requests} api={this.props.api} />
            </section>
          </>
        )}
      </div>
    );
  }
}

export default Requests;
