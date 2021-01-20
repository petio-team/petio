import React from "react";
import Api from "../data/Api";

import Modal from "../components/Modal";

import { ReactComponent as Arrow } from "../assets/svg/arrow-left.svg";
import { ReactComponent as Check } from "../assets/svg/check.svg";
import { ReactComponent as Close } from "../assets/svg/close.svg";

class Users extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sortBy: "title",
      dir: "DESC",
      addUserOpen: false,
    };

    this.sortBy = this.sortBy.bind(this);
    this.sortCol = this.sortCol.bind(this);
    this.inputChange = this.inputChange.bind(this);
    this.createUser = this.createUser.bind(this);
    this.getArrs = this.getArrs.bind(this);
  }
  componentDidMount() {
    let page = document.querySelectorAll(".page-wrap")[0];
    page.scrollTop = 0;
    window.scrollTo(0, 0);
    this.getArrs();
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
    });
  }

  inputChange(e) {
    const target = e.target;
    const name = target.name;
    let value = target.value;

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

  async createUser() {
    console.log({
      id: `custom_${this.state.cu_username.replace(" ", "-")}`,
      username: this.state.cu_username,
      email: this.state.cu_email,
      password: this.state.cu_password,
      linked: this.state.cu_linked,
    });

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
        <Modal title="Add Profile" open={this.state.addProfileOpen} close={() => this.closeModal("addProfile")} submit={false}>
          <p className="sub-title mb--1">New profile</p>
          <input className="styled-input--input" placeholder="Name" type="text" name="np_name" value={this.state.np_name} onChange={this.inputChange} />
          <p className="sub-title mb--1">Sonarr</p>
          {this.state.s_servers ? (
            this.state.s_servers.map((server) => {
              return (
                <label key={server.uuid}>
                  <input type="checkbox" value={this.state[`np_sonarr_option_${server.uuid}`]} name={`np_sonarr_option_${server.uuid}`} onChange={this.inputChange} /> {server.title}
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
                  <input type="checkbox" value={this.state[`np_radarr_option_${server.uuid}`]} name={`np_radarr_option_${server.uuid}`} onChange={this.inputChange} /> {server.title}
                </label>
              );
            })
          ) : (
            <p>No Sonarr Servers</p>
          )}
          <p className="sub-title mb--1">Auto Approve</p>
          <label>
            <input type="checkbox" name="np_auto_approve" /> Enabled
          </label>
          <p className="sub-title mb--1">Quota</p>
          <p>
            <small>Quota of requests per week. For no limit leave at 0</small>
          </p>
          <input className="styled-input--input" type="number" name="np_quota" defaultValue={0} value={this.state.np_quote} onChange={this.inputChange} />
        </Modal>
        <section>
          <div className="title-btn">
            <p className="main-title">User Profiles</p>
            <button className="btn btn__square" onClick={() => this.openModal("addProfile")}>
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
                <th>Quota</th>
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
            </tbody>
          </table>
        </section>

        <section>
          <div className="title-btn">
            <p className="main-title">Users</p>
            <button className="btn btn__square" onClick={() => this.openModal("addUser")}>
              Add +
            </button>
          </div>
        </section>
        <section>
          <table className="generic-table generic-table__rounded">
            <thead>
              <tr>
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
