import React from "react";
import Api from "../data/Api";
import User from "../data/User";
import { ReactComponent as Spinner } from "../assets/svg/spinner.svg";
import RequestsTable from "../components/RequestsTable";
import Modal from "../components/Modal";

class Requests extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      requests: this.props.user.requests,
      pending: false,
      users: {},
      editRequestOpen: false,
    };

    this.getRequests = this.getRequests.bind(this);
    this.editReq = this.editReq.bind(this);
    this.getArrs = this.getArrs.bind(this);
  }

  componentDidMount() {
    this.getArrs();
    User.getRequests(true);
    this.getRequests(true);
    this.heartbeat = setInterval(() => this.getRequests(true), 60000);

    let page = document.querySelectorAll(".page-wrap")[0];
    page.scrollTop = 0;
    window.scrollTo(0, 0);
  }

  openModal(id) {
    this.setState({
      [`${id}Open`]: true,
    });
  }

  closeModal(id) {
    this.setState({
      [`${id}Open`]: false,
    });
  }

  inputChange(e) {
    const target = e.target;
    const name = target.name;
    let value = target.type === "checkbox" ? target.checked : target.value;

    this.setState({
      [name]: value,
    });
  }

  async getArrs() {
    try {
      let radarr = await Api.radarrConfig();
      let sonarr = await Api.sonarrConfig();
      this.setState({
        r_servers: radarr,
        s_servers: sonarr,
      });
    } catch (err) {
      console.log(err);
      this.setState({
        r_servers: false,
        s_servers: false,
      });
    }
  }

  editReq(req) {
    this.setState({
      activeRequest: req,
    });
    this.openModal("editRequest");
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

  findServerByUuid(uuid, type) {
    for (let s in this.state[type]) {
      let server = this.state[type][s];
      if (server.uuid === uuid) {
        return server;
      }
    }
    return false;
  }

  render() {
    return (
      <>
        <Modal title="Edit Request" open={this.state.editRequestOpen} close={() => this.closeModal("editRequest")}>
          {this.state.activeRequest ? (
            <>
              <p className="sub-title mb--1">{this.state.activeRequest.title}</p>
              <p className="sub-title mt--2 mb--1">Edit {this.state.activeRequest.type === "tv" ? "Sonarr" : "Radarr"}</p>
              {this.state.activeRequest.type === "tv" ? (
                this.state.activeRequest.sonarrId.length > 0 ? (
                  this.state.activeRequest.sonarrId.map((s) => {
                    let uuid = Object.keys(s)[0];
                    let server = this.findServerByUuid(uuid, "s_servers");
                    return <p style={{ marginBottom: 0 }}>Request already sent to {server.title}</p>;
                  })
                ) : this.state.s_servers ? (
                  this.state.s_servers.map((server) => {
                    return (
                      <label key={server.uuid}>
                        <input data-type="np_radarr" type="checkbox" checked={this.state.np_sonarr ? this.state.np_sonarr[server.uuid] : false} name={server.uuid} onChange={this.changeCheckbox} />{" "}
                        {server.title}
                      </label>
                    );
                  })
                ) : (
                  <p>No Sonarr Servers</p>
                )
              ) : this.state.activeRequest.radarrId.length > 0 ? (
                this.state.activeRequest.radarrId.map((r) => {
                  let uuid = Object.keys(r)[0];
                  let server = this.findServerByUuid(uuid, "r_servers");
                  return <p style={{ marginBottom: 0 }}>Request already sent to {server.title}</p>;
                })
              ) : this.state.r_servers ? (
                this.state.r_servers.map((server) => {
                  return (
                    <label key={server.uuid}>
                      <input data-type="np_radarr" type="checkbox" checked={this.state.np_radarr ? this.state.np_radarr[server.uuid] : false} name={server.uuid} onChange={this.changeCheckbox} />{" "}
                      {server.title}
                    </label>
                  );
                })
              ) : (
                <p>No Radarr Servers</p>
              )}
              {this.state.activeRequest.approved ? null : <p>Submitting will also immediately approve this request</p>}
            </>
          ) : null}
        </Modal>
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
                <RequestsTable requests={this.state.requests} api={this.props.api} editReq={this.editReq} />
              </section>
            </>
          )}
        </div>
      </>
    );
  }
}

export default Requests;
