import React from "react";
import Api from "../data/Api";

import Modal from "../components/Modal";

import { ReactComponent as Arrow } from "../assets/svg/arrow-left.svg";
import { ReactComponent as Check } from "../assets/svg/check.svg";
import { ReactComponent as Close } from "../assets/svg/close.svg";
import { saveProfile } from "../data/Api/actions";

class Users extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sortBy: "title",
      dir: "DESC",
      addUserOpen: false,
      np_name: "",
      np_quota: 0,
      np_auto_approve: false,
      np_sonarr: {},
      np_radarr: {},
      bulk_users: {},
      bulk_users_all: false,
    };

    this.sortBy = this.sortBy.bind(this);
    this.sortCol = this.sortCol.bind(this);
    this.inputChange = this.inputChange.bind(this);
    this.createUser = this.createUser.bind(this);
    this.getArrs = this.getArrs.bind(this);
    this.getProfiles = this.getProfiles.bind(this);
    this.saveProfile = this.saveProfile.bind(this);
    this.changeCheckbox = this.changeCheckbox.bind(this);
    this.findServerByUuid = this.findServerByUuid.bind(this);
  }
  componentDidMount() {
    let page = document.querySelectorAll(".page-wrap")[0];
    page.scrollTop = 0;
    window.scrollTo(0, 0);
    this.getArrs();
    this.getProfiles();
  }

  sortBy(a, b) {
    let sortVal = this.state.sortBy;
    if (a[sortVal].toLowerCase() > b[sortVal].toLowerCase()) {
      return this.state.dir === "DESC" ? 1 : -1;
    }
    if (a[sortVal].toLowerCase() < b[sortVal].toLowerCase()) {
      return this.state.dir === "DESC" ? -1 : 1;
    }
    return 0;
  }

  sortAz(a, b) {
    if (a.title.toLowerCase() > b.title.toLowerCase()) {
      return 1;
    }
    if (a.title.toLowerCase() < b.title.toLowerCase()) {
      return -1;
    }
    return 0;
  }

  sortCol(type) {
    if (!type) return;
    let sw = this.state.sortBy === type ? true : false;
    let dir = sw ? (this.state.dir === "DESC" ? "ASC" : "DESC") : "DESC";
    this.setState({
      dir: dir,
      sortBy: type,
    });
  }

  openModal(id) {
    this.setState({
      [`${id}Open`]: true,
    });
  }

  closeModal(id) {
    this.setState({
      [`${id}Open`]: false,
      cu_username: "",
      cu_email: "",
      cu_password: "",
      cu_linked: "",
      cu_error: false,
      np_name: "",
      np_auto_approve: false,
      np_quota: 0,
      np_radarr: [],
      np_sonarr: [],
      activeProfile: false,
    });
  }

  inputChange(e) {
    const target = e.target;
    const name = target.name;
    let value = target.type === "checkbox" ? target.checked : target.value;
    if (name === "bulk_users_all") {
      let userCheckboxes = document.querySelectorAll(".user-checkbox");
      let bu = {};
      if (!this.state.bulk_users_all)
        for (let c = 0; c < userCheckboxes.length; c++) {
          let cb = userCheckboxes[c];
          bu[cb.name] = true;
        }
      this.setState({
        [name]: value,
        bulk_users: bu,
      });
    } else {
      this.setState({
        [name]: value,
      });
    }
  }

  changeCheckbox(e) {
    const target = e.target;
    const name = target.name;
    let value = target.checked;
    let type = target.dataset.type;

    this.setState({
      bulk_users_all: false,
      [type]: {
        ...this.state[type],
        [name]: value,
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
    } catch (err) {
      console.log(err);
      this.setState({
        r_servers: false,
        s_servers: false,
      });
    }
  }

  async getProfiles() {
    try {
      let profiles = await Api.getProfiles();
      this.setState({
        profiles: profiles,
      });
    } catch (err) {
      console.log(err);
      this.setState({
        profiles: [],
      });
    }
  }

  async createUser() {
    let newUser = await Api.createUser({
      id: `custom_${this.state.cu_username.replace(" ", "-")}`,
      username: this.state.cu_username,
      email: this.state.cu_email,
      password: this.state.cu_password,
      linked: this.state.cu_linked,
    });

    if (newUser.error) {
      this.setState({
        cu_error: newUser.error,
      });
    } else {
      this.closeModal("addUser");
      Api.allUsers();
    }
  }

  async saveProfile() {
    await Api.saveProfile({
      id: this.state.activeProfile,
      name: this.state.np_name,
      quota: this.state.np_quota,
      radarr: this.state.np_radarr,
      sonarr: this.state.np_sonarr,
      autoApprove: this.state.np_auto_approve,
    });
    this.closeModal("addProfile");
    this.getProfiles();
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
    let usersUnsorted = Object.values(this.props.api.users);
    let usersSorted = usersUnsorted.sort(this.sortBy);
    let usersAz = Object.values(usersUnsorted).sort(this.sortAz);
    return (
      <>
        <Modal title="Add User" open={this.state.addUserOpen} close={() => this.closeModal("addUser")} submit={this.createUser}>
          <p className="sub-title mb--1">New user</p>
          <input className="styled-input--input" placeholder="Username" type="text" name="cu_username" value={this.state.cu_username} onChange={this.inputChange} />
          <input className="styled-input--input" placeholder="Email" type="email" name="cu_email" value={this.state.cu_email} onChange={this.inputChange} />
          <p className="sub-title mt--2 mb--1">Password</p>
          <input className="styled-input--input" placeholder="Password" type="text" name="cu_password" value={this.state.cu_password} onChange={this.inputChange} />
          <p className="sub-title mt--2 mb--1">Link history to existing user</p>
          <div className="styled-input--select">
            <select name="cu_linked" value={this.state.cu_linked} onChange={this.inputChange}>
              <option value="">None</option>
              {Object.keys(usersAz).map((u) => {
                let user = usersAz[u];
                return (
                  <option key={`user_linked_${user._id}`} value={user.altId ? user.altId : user.id}>
                    {user.title}
                  </option>
                );
              })}
            </select>
          </div>
          {this.state.cu_error ? <p>{this.state.cu_error}</p> : null}
        </Modal>
        <Modal title="Add Profile" open={this.state.addProfileOpen} close={() => this.closeModal("addProfile")} submit={this.saveProfile}>
          <p className="sub-title mb--1">New profile</p>
          <input className="styled-input--input" placeholder="Name" type="text" name="np_name" value={this.state.np_name} onChange={this.inputChange} />
          <p className="sub-title mb--1">Sonarr</p>
          {this.state.s_servers ? (
            this.state.s_servers.map((server) => {
              return (
                <label key={server.uuid}>
                  <input data-type="np_sonarr" type="checkbox" checked={this.state.np_sonarr[server.uuid]} name={server.uuid} onChange={this.changeCheckbox} /> {server.title}
                </label>
              );
            })
          ) : (
            <p>No Sonarr Servers</p>
          )}
          <p className="sub-title mb--1">Radarr</p>
          {this.state.r_servers ? (
            this.state.r_servers.map((server) => {
              return (
                <label key={server.uuid}>
                  <input data-type="np_radarr" type="checkbox" checked={this.state.np_radarr[server.uuid]} name={server.uuid} onChange={this.changeCheckbox} /> {server.title}
                </label>
              );
            })
          ) : (
            <p>No Sonarr Servers</p>
          )}
          <p className="sub-title mb--1">Auto Approve</p>
          <label>
            <input type="checkbox" name="np_auto_approve" checked={this.state.np_auto_approve} onChange={this.inputChange} /> Enabled
          </label>
          <p className="sub-title mb--1">Quota</p>
          <p>
            <small>Quota of requests per week. For no limit leave at 0</small>
          </p>
          <input className="styled-input--input" type="number" name="np_quota" value={this.state.np_quota} onChange={this.inputChange} />
        </Modal>
        <section>
          <div className="title-btn">
            <p className="main-title">User Profiles</p>
            <button
              className="btn btn__square"
              onClick={() => {
                this.openModal("addProfile");
                this.setState({ activeProfile: false });
              }}
            >
              Add +
            </button>
          </div>
        </section>
        <section>
          <p className="mb--2">
            User profiles determine what should happen when a user makes a request. If using Sonarr / Radarr you can pick which servers the request is sent to. You can also choose to allow auto
            approval for certain users.
          </p>
          <table className="generic-table generic-table__rounded">
            <thead>
              <tr>
                <th>Name</th>
                <th>Sonarr</th>
                <th>Radarr</th>
                <th>Auto approve</th>
                <th>Quota (per week)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Default</td>
                <td>All</td>
                <td>All</td>
                <td>Yes</td>
                <td>∞</td>
                <td>None</td>
              </tr>
              {this.state.profiles && this.state.s_servers
                ? this.state.profiles.map((profile) => {
                    return (
                      <tr key={profile._id}>
                        <td>{profile.name}</td>
                        <td>
                          {Object.keys(profile.sonarr).length > 0
                            ? Object.keys(profile.sonarr).map((s) => {
                                let server = this.findServerByUuid(s, "s_servers");
                                let serverName = server ? server.title : "Not Found";
                                return (
                                  <span key={`${profile._id}_${s}`} className="requests--status requests--status__sonarr">
                                    {serverName}
                                  </span>
                                );
                              })
                            : "None"}
                        </td>
                        <td>
                          {Object.keys(profile.radarr).length > 0
                            ? Object.keys(profile.radarr).map((r) => {
                                let server = this.findServerByUuid(r, "r_servers");
                                let serverName = server ? server.title : "Not Found";
                                return (
                                  <span key={`${profile._id}_${r}`} className="requests--status requests--status__radarr">
                                    {serverName}
                                  </span>
                                );
                              })
                            : "None"}
                        </td>
                        <td>{profile.autoApprove ? "Yes" : "No"}</td>
                        <td>{profile.quota === 0 ? "∞" : profile.quota}</td>
                        <td>None</td>
                      </tr>
                    );
                  })
                : null}
            </tbody>
          </table>
        </section>

        <section>
          <div className="title-btn">
            <p className="main-title">Users</p>
            <button className="btn btn__square" onClick={() => this.openModal("addUser")}>
              Add +
            </button>
            <button className={`btn btn__square ${Object.keys(this.state.bulk_users).length > 0 ? "" : "disabled"}`} onClick={() => this.openModal("bulkUsers")}>
              Bulk edit
            </button>
          </div>
        </section>
        <section>
          <table className="generic-table generic-table__rounded">
            <thead>
              <tr>
                <th>
                  <input className="checkbox-small" type="checkbox" checked={this.state.bulk_users_all} name={"bulk_users_all"} onChange={this.inputChange} />
                </th>
                <th className={`sortable ${this.state.sortBy === "title" ? "active" : ""} ${this.state.dir}`} onClick={() => this.sortCol("title")}>
                  Title
                  <Arrow />
                </th>
                <th className={`sortable ${this.state.sortBy === "username" ? "active" : ""} ${this.state.dir}`} onClick={() => this.sortCol("username")}>
                  Username
                  <Arrow />
                </th>
                <th className={`sortable ${this.state.sortBy === "email" ? "active" : ""} ${this.state.dir}`} onClick={() => this.sortCol("email")}>
                  Email
                  <Arrow />
                </th>
                <th>Role</th>
                <th>Profile</th>
                <th>Active</th>
                <th>Last IP</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(usersSorted).map((u) => {
                let user = usersSorted[u];
                return (
                  <tr key={user._id}>
                    <td>
                      <input className="checkbox-small user-checkbox" data-type="bulk_users" type="checkbox" checked={this.state.bulk_users[user._id]} name={user._id} onChange={this.changeCheckbox} />
                    </td>
                    <td>
                      {user.title} {user.custom ? "(Custom)" : ""}
                    </td>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>{user.role ? user.role : "user"}</td>
                    <td>{user.profile ? user.profile : "default"}</td>
                    <td>
                      <div className="table-icon">{user.disabled ? <Close /> : <Check />}</div>
                    </td>
                    <td>{user.lastIp ? user.lastIp : "n/a"}</td>
                    <td></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      </>
    );
  }
}

export default Users;
