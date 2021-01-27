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
      deleteRequestOpen: false,
      edit_radarr: {},
      edit_sonarr: {},
      req_delete_reason: "",
    };

    this.getRequests = this.getRequests.bind(this);
    this.editReq = this.editReq.bind(this);
    this.getArrs = this.getArrs.bind(this);
    this.processServers = this.processServers.bind(this);
    this.changeServerSettings = this.changeServerSettings.bind(this);
    this.renderReqEdit = this.renderReqEdit.bind(this);
    this.deleteReq = this.deleteReq.bind(this);
    this.updateReq = this.updateReq.bind(this);
    this.removeReq = this.removeReq.bind(this);
    this.approveReq = this.approveReq.bind(this);
    this.inputChange = this.inputChange.bind(this);
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
      req_delete_reason: "",
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

  changeServerSettings(e) {
    const target = e.target;
    const name = target.name;
    let value = target.type === "checkbox" ? target.checked : target.value;
    let type = target.dataset.type;
    let id = target.dataset.id;

    this.setState({
      [`edit_${type}`]: {
        ...this.state[`edit_${type}`],
        [id]: {
          ...this.state[`edit_${type}`][id],
          [name]: value,
        },
      },
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
      this.processServers();
    } catch (err) {
      console.log(err);
      this.setState({
        r_servers: false,
        s_servers: false,
      });
    }
  }

  async processServers() {
    let radarr = this.state.r_servers;
    let sonarr = this.state.s_servers;

    await Promise.all(
      radarr.map(async (server) => {
        let options = await this.getArrOptions(server.uuid, "radarr");
        server.options = options;
      })
    );
    await Promise.all(
      sonarr.map(async (server) => {
        let options = await this.getArrOptions(server.uuid, "sonarr");
        server.options = options;
      })
    );

    this.setState({
      s_servers: sonarr,
      r_servers: radarr,
    });
  }

  async getArrOptions(uuid, type) {
    try {
      let settings = type === "radarr" ? await Api.radarrOptions(uuid) : await Api.sonarrOptions(uuid);
      if (settings.profiles.error || settings.paths.error) {
        return;
      }
      return {
        profiles: settings.profiles,
        paths: settings.paths,
      };
    } catch {
      return {
        profiles: false,
        paths: false,
      };
    }
  }

  editReq(req) {
    let edit_radarr = {};
    let edit_sonarr = {};
    if (req.type === "movie") {
      if (req.radarrId.length > 0) {
        req.radarrId.map((r, i) => {
          let uuid = Object.keys(r)[0];
          let child = req.children[i] ? req.children[i].info : {};
          edit_radarr[uuid] = {
            active: true,
            profile: child.qualityProfileId ? child.qualityProfileId : false,
            path: child.path ? child.path.replace(`/${req.title} (${child.year})`, "").replace(`\\${req.title} (${child.year})`, "") : false,
          };
        });
      }
    }
    if (req.type === "tv") {
      if (req.sonarrId.length > 0) {
        req.sonarrId.map((r, i) => {
          let uuid = Object.keys(r)[0];
          let child = req.children[i] ? req.children[i].info : {};
          edit_sonarr[uuid] = {
            active: true,
            profile: child.qualityProfileId ? child.qualityProfileId : false,
            path: child.path ? child.path.replace(`/${req.title} (${child.year})`, "").replace(`\\${req.title} (${child.year})`, "") : false,
          };
        });
      }
    }
    this.setState({
      activeRequest: req,
      edit_radarr: edit_radarr,
      edit_sonarr: edit_sonarr,
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

  renderReqEdit(server, type) {
    let editable = this.state.activeRequest[`${type}Id`].length === 0;
    return (
      <div className="request-edit--server--wrap" key={`${type}_server_${server.uuid}`}>
        <p className="request-edit--server--title">Server name: {server.title}</p>
        <label key={server.uuid} className={editable ? "" : "disabled"}>
          <input
            data-type={type}
            data-id={server.uuid}
            type="checkbox"
            checked={this.state[`edit_${type}`][server.uuid] ? this.state[`edit_${type}`][server.uuid].active : false}
            name={"active"}
            onChange={this.changeServerSettings}
          />
          Use this server
        </label>
        <p className="request-edit--server--subtitle">Profile</p>
        {server.options ? (
          <>
            <div className={`styled-input--select ${editable ? "" : "disabled"}`}>
              <select
                data-type={type}
                data-id={server.uuid}
                name="profile"
                value={this.state[`edit_${type}`][server.uuid] ? this.state[`edit_${type}`][server.uuid].profile : false}
                onChange={this.changeServerSettings}
              >
                <option value="">Please choose</option>
                {server.options.profiles ? (
                  server.options.profiles.map((profile, i) => {
                    return (
                      <option key={`${type}_profile_${server.uuid}_${profile.id}`} value={profile.id}>
                        {profile.name}
                      </option>
                    );
                  })
                ) : (
                  <option value=""></option>
                )}
              </select>
            </div>
            <p className="request-edit--server--subtitle">Root Path</p>
            <div className={`styled-input--select ${editable ? "" : "disabled"}`}>
              <select
                data-type={type}
                data-id={server.uuid}
                name="path"
                value={this.state[`edit_${type}`][server.uuid] ? this.state[`edit_${type}`][server.uuid].path : false}
                onChange={this.changeServerSettings}
              >
                <option value="">Please choose</option>
                {server.options.paths ? (
                  server.options.paths.map((path, i) => {
                    return (
                      <option key={`${type}_profile_${server.uuid}_${path.id}`} value={path.path}>
                        {path.path}
                      </option>
                    );
                  })
                ) : (
                  <option value=""></option>
                )}
              </select>
            </div>
          </>
        ) : (
          <p>Error with Server settings</p>
        )}
        {editable ? null : (
          <p style={{ margin: 0 }}>
            <small>{`These settings cannot be edited once sent to ${type}`}</small>
          </p>
        )}
      </div>
    );
  }

  deleteReq() {
    this.closeModal("editRequest");
    this.openModal("deleteRequest");
  }

  updateReq() {
    this.closeModal("editRequest");
    alert("req updated");
  }

  approveReq() {
    this.closeModal("editRequest");
    alert("req approved");
  }

  async removeReq() {
    let reason = this.state.req_delete_reason.length > 0 ? this.state.req_delete_reason : false;
    let remove = await Api.removeRequest(this.state.activeRequest, reason);
    if (remove) {
      this.closeModal("deleteRequest");
      this.getRequests(true);
    } else {
      alert("Failed to remove request");
    }
  }

  render() {
    return (
      <>
        <Modal title="Remove Request" open={this.state.deleteRequestOpen} close={() => this.closeModal("deleteRequest")} submit={this.removeReq}>
          <p className="sub-title mb--1">Removing {this.state.activeRequest ? this.state.activeRequest.title : ""}</p>
          <textarea
            className="styled-input--textarea"
            value={this.state.req_delete_reason}
            placeholder="Message to user: E.g Sorry this Movie is not available"
            name="req_delete_reason"
            onChange={this.inputChange}
          ></textarea>
          <p style={{ margin: 0 }}>
            <small>Note: This is final and cannot be undone, this will also remove the request from Sonarr / Radarr if applicable.</small>
          </p>
        </Modal>
        <Modal
          title="Edit Request"
          open={this.state.editRequestOpen}
          close={() => this.closeModal("editRequest")}
          submitText={this.state.activeRequest ? (this.state.activeRequest.sonarrId.length > 0 || this.state.activeRequest.radarrId.length > 0 ? "Save" : "Save & Approve") : false}
          deleteText={this.state.activeRequest ? (this.state.activeRequest.sonarrId.length > 0 || this.state.activeRequest.radarrId.length > 0 ? "Delete" : "Deny") : false}
          delete={this.deleteReq}
          submit={this.state.activeRequest ? (this.state.activeRequest.sonarrId.length > 0 || this.state.activeRequest.radarrId.length > 0 ? this.updateReq : this.approveReq) : false}
        >
          {this.state.activeRequest ? (
            <>
              <p className="sub-title mb--1">{this.state.activeRequest.title}</p>
              <p className="sub-title mt--2 mb--1">Edit {this.state.activeRequest.type === "tv" ? "Sonarr" : "Radarr"}</p>
              {this.state.activeRequest.type === "tv" ? (
                this.state.s_servers ? (
                  this.state.s_servers.map((server) => {
                    return this.renderReqEdit(server, "sonarr");
                  })
                ) : (
                  <p>No Radarr Servers</p>
                )
              ) : this.state.r_servers ? (
                this.state.r_servers.map((server) => {
                  return this.renderReqEdit(server, "radarr");
                })
              ) : (
                <p>No Radarr Servers</p>
              )}
              {this.state.activeRequest.approved ? null : <p style={{ margin: 0 }}>Submitting will also immediately approve this request</p>}
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
