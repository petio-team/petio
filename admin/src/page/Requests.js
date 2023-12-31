import React from "react";
import Api from "../data/Api";
import User from "../data/User";
import { ReactComponent as Spinner } from "../assets/svg/spinner.svg";
import RequestsTable from "../components/RequestsTable";
import Modal from "../components/Modal";
import { ReactComponent as WarningIcon } from "../assets/svg/warning.svg";

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
    // this.approveReq = this.approveReq.bind(this);
    this.inputChange = this.inputChange.bind(this);
    this.statusChange = this.statusChange.bind(this);
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

  closeModal(id, clear = false) {
    if (clear) {
      this.setState({
        [`${id}Open`]: false,
        req_delete_reason: "",
        activeRequest: false,
      });
    } else {
      this.setState({
        [`${id}Open`]: false,
        req_delete_reason: "",
      });
    }
  }

  inputChange(e) {
    const target = e.target;
    const name = target.name;
    let value = target.type === "checkbox" ? target.checked : target.value;

    this.setState({
      [name]: value,
    });
  }

  statusChange(e) {
    const target = e.target;
    let value = target.value;
    let activeRequest = this.state.activeRequest;
    activeRequest.manualStatus = value;

    this.setState({
      activeRequest: activeRequest,
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

    if (radarr)
      await Promise.all(
        radarr.map(async (server) => {
          let options = await this.getArrOptions(server.uuid, "radarr");
          server.options = options;
        })
      );

    if (sonarr)
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
      let settings =
        type === "radarr"
          ? await Api.radarrOptions(uuid)
          : await Api.sonarrOptions(uuid);
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

  editReq(reqD) {
    let edit_radarr = {};
    let edit_sonarr = {};
    let req = this.props.user.requests[reqD.requestId];
    if (!req) {
      this.props.msg({ message: "Error editing request", type: "error" });
      return;
    }
    if (req.type === "movie") {
      if (req.radarrId.length > 0) {
        req.radarrId.map((r, i) => {
          let uuid = Object.keys(r)[0];
          let child =
            req.children && req.children[i] ? req.children[i].info : {};
          let path = false;
          if (child.path) {
            path = child.path
              .replace(`/${req.title} (${child.year})`, "")
              .replace(`\\${req.title} (${child.year})`, "");
          }
          edit_radarr[uuid] = {
            active: true,
            profile: child.qualityProfileId ? child.qualityProfileId : false,
            path: path,
          };
        });
      } else {
        if (req.defaults) {
          Object.keys(req.defaults).map((s) => {
            let uuid = s;
            let server = req.defaults[s];
            edit_radarr[uuid] = {
              active: true,
              profile: server.profile,
              path: server.path,
            };
          });
        }
      }
    }
    if (req.type === "tv") {
      if (req.sonarrId.length > 0) {
        req.sonarrId.map((r, i) => {
          let uuid = Object.keys(r)[0];
          let child = req.children[i] ? req.children[i].info : {};
          let path = false;
          if (child.rootFolderPath) {
            path = child.rootFolderPath.slice(0, -1);
          }
          edit_sonarr[uuid] = {
            active: true,
            profile: child.qualityProfileId ? child.qualityProfileId : false,
            path: path,
          };
        });
      } else {
        if (req.defaults) {
          Object.keys(req.defaults).map((s) => {
            let uuid = s;
            let server = req.defaults[s];
            edit_sonarr[uuid] = {
              active: true,
              profile: server.profile,
              path: server.path,
            };
          });
        }
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
      <div
        className="request-edit--server--wrap"
        key={`${type}_server_${server.uuid}`}
      >
        <p className="request-edit--server--title">
          Server name: {server.title}
        </p>
        <label key={server.uuid} className={editable ? "" : "disabled"}>
          <input
            data-type={type}
            data-id={server.uuid}
            type="checkbox"
            checked={
              this.state[`edit_${type}`][server.uuid]
                ? this.state[`edit_${type}`][server.uuid].active
                : false
            }
            name={"active"}
            onChange={this.changeServerSettings}
          />
          Use this server
        </label>

        {server.options ? (
          <>
            <p className="request-edit--server--subtitle">Profile</p>
            <div
              className={`styled-input--select ${editable ? "" : "disabled"}`}
            >
              <select
                data-type={type}
                data-id={server.uuid}
                name="profile"
                value={
                  this.state[`edit_${type}`][server.uuid]
                    ? this.state[`edit_${type}`][server.uuid].profile
                    : false
                }
                onChange={this.changeServerSettings}
              >
                <option value="">Please choose</option>
                {server.options.profiles ? (
                  server.options.profiles.map((profile) => {
                    return (
                      <option
                        key={`${type}_profile_${server.uuid}_${profile.id}`}
                        value={profile.id}
                      >
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
            <div
              className={`styled-input--select ${editable ? "" : "disabled"}`}
            >
              <select
                data-type={type}
                data-id={server.uuid}
                name="path"
                value={
                  this.state[`edit_${type}`][server.uuid]?.path
                    ? this.state[`edit_${type}`][server.uuid]?.path
                    : false
                }
                data-value={
                  this.state[`edit_${type}`][server.uuid]?.path
                    ? this.state[`edit_${type}`][server.uuid]?.path
                    : false
                }
                onChange={this.changeServerSettings}
              >
                <option value="">Please choose</option>
                {server.options.paths ? (
                  server.options.paths.map((path) => {
                    return (
                      <option
                        key={`${type}_profile_${server.uuid}_${path.id}`}
                        value={path.path}
                      >
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
          <>
            <p className="request-edit--server--subtitle">Profile</p>
            <div className="styled-input--select disabled">
              <select>
                <option value="">Loading...</option>
              </select>
            </div>
            <p className="request-edit--server--subtitle">Root Path</p>
            <div className="styled-input--select disabled">
              <select>
                <option value="">Loading...</option>
              </select>
            </div>
          </>
        )}
        {editable ? null : (
          <p style={{ margin: 0 }}>
            <small>
              {`These settings cannot be edited once sent to `}
              <span style={{ textTransform: "capitalize" }}>{type}</span>
            </small>
          </p>
        )}
      </div>
    );
  }

  deleteReq() {
    this.closeModal("editRequest");
    this.openModal("deleteRequest");
  }

  // updateReq() {
  //   this.props.msg({
  //     message: `Request Updated: ${this.state.activeRequest.title}`,
  //     type: "good",
  //   });
  //   this.closeModal("editRequest");
  // }

  async updateReq() {
    let servers = {};
    let err = false;
    let type_server = {};
    if (this.state.activeRequest.type === "tv") {
      type_server = this.state.edit_sonarr;
    } else {
      type_server = this.state.edit_radarr;
    }
    if (Object.keys(type_server).length > 0) {
      Object.keys(type_server).map((r) => {
        let server = type_server[r];
        if (server.active) {
          if (server.profile && server.path) {
            servers[r] = server;
          } else {
            err = "Missing Path / Profile";
          }
        }
      });
    }

    if (
      this.state.activeRequest.type === "tv" &&
      servers &&
      !this.state.activeRequest.tvdb_id
    ) {
      err = "No TVDb ID Cannot add to Sonarr";
    }

    if (
      this.state.activeRequest.type === "movie" &&
      servers &&
      !this.state.activeRequest.tmdb_id
    ) {
      err = "No TMDb ID Cannot add to Radarr";
    }

    if (err) {
      this.props.msg({ message: err, type: "error" });
      return;
    }

    let title = this.state.activeRequest.title;
    let approved = this.state.activeRequest.approved;

    await Api.updateRequest(this.state.activeRequest, servers);
    this.closeModal("editRequest", true);
    this.getRequests(true);
    this.props.msg({
      message: approved
        ? `Request Updated: ${title}`
        : `Request Approved: ${title}`,
      type: "good",
    });
  }

  async removeReq() {
    let request = this.state.activeRequest;
    let reason =
      this.state.req_delete_reason.length > 0
        ? this.state.req_delete_reason
        : false;
    let remove = await Api.removeRequest(request, reason);
    if (remove) {
      this.closeModal("deleteRequest", true);
      this.getRequests(true);
      this.props.msg({
        message: `Request removed - ${request.title}`,
        type: "good",
      });
    } else {
      this.props.msg({ message: "Failed to remove request", type: "error" });
    }
  }

  render() {
    return (
      <>
        <Modal
          title="Remove Request"
          open={this.state.deleteRequestOpen}
          close={() => this.closeModal("deleteRequest", true)}
          submit={this.removeReq}
        >
          <p className="sub-title mb--1">
            Removing{" "}
            {this.state.activeRequest ? this.state.activeRequest.title : ""}
          </p>
          <textarea
            className="styled-input--textarea"
            value={this.state.req_delete_reason}
            placeholder="Message to user: E.g Sorry this Movie is not available"
            name="req_delete_reason"
            onChange={this.inputChange}
          ></textarea>
          <p style={{ margin: 0 }}>
            <small>
              Note: This is final and cannot be undone, this will also remove
              the request from Sonarr / Radarr if applicable.
            </small>
          </p>
        </Modal>
        <Modal
          title="Edit Request"
          open={this.state.editRequestOpen}
          close={() => this.closeModal("editRequest", true)}
          submitText={
            this.state.activeRequest
              ? this.state.activeRequest.approved
                ? "Save"
                : "Save & Approve"
              : false
          }
          deleteText={
            this.state.activeRequest
              ? this.state.activeRequest.approved
                ? "Delete"
                : "Deny"
              : false
          }
          delete={this.deleteReq}
          submit={this.updateReq}
        >
          {this.state.activeRequest ? (
            <>
              {this.state.activeRequest.type === "tv" &&
              !this.state.activeRequest.tvdb_id ? (
                <p className="warning-text">
                  <WarningIcon /> No TVDb ID
                </p>
              ) : null}
              <p className="sub-title mb--1">
                {this.state.activeRequest.title}
              </p>
              {this.state.activeRequest.type === "tv" &&
              !this.state.activeRequest.tvdb_id ? (
                <p>Can&apos;t send to DVR without TVDB ID</p>
              ) : (
                <>
                  <p className="sub-title mt--2 mb--1">
                    Edit{" "}
                    {this.state.activeRequest.type === "tv"
                      ? "Sonarr"
                      : "Radarr"}
                  </p>
                  {this.state.activeRequest.type === "tv" ? (
                    this.state.s_servers && this.state.s_servers.length > 0 ? (
                      this.state.s_servers.map((server) => {
                        return this.renderReqEdit(server, "sonarr");
                      })
                    ) : (
                      <p>No Sonarr Servers</p>
                    )
                  ) : this.state.r_servers &&
                    this.state.r_servers.length > 0 ? (
                    this.state.r_servers.map((server) => {
                      return this.renderReqEdit(server, "radarr");
                    })
                  ) : (
                    <p>No Radarr Servers</p>
                  )}
                  {this.state.activeRequest.approved ? null : (
                    <p style={{ margin: 0 }}>
                      Submitting will also immediately approve this request
                    </p>
                  )}
                </>
              )}
              <p className="sub-title mt--2">Manually Set Status</p>
              <p className="mb--1">
                <small>This will only be used for untracked requests</small>
              </p>
              <div className="styled-input--select">
                <select
                  name="manualStatus"
                  value={this.state.activeRequest.manualStatus}
                  onChange={this.statusChange}
                >
                  <option value="">None</option>
                  <option value="3">Processing</option>
                  <option value="4">Finalising</option>
                  <option value="5">Complete</option>
                </select>
              </div>
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
                <RequestsTable
                  requests={this.props.user.requests}
                  api={this.props.api}
                  editReq={this.editReq}
                />
              </section>
            </>
          )}
        </div>
      </>
    );
  }
}

export default Requests;
