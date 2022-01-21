import React from "react";
import Api from "../data/Api";

import Modal from "../components/Modal";

import { ReactComponent as Arrow } from "../assets/svg/arrow-left.svg";
import { ReactComponent as Check } from "../assets/svg/check.svg";
import { ReactComponent as Close } from "../assets/svg/close.svg";
import Profiles from "./users/Profiles";

class Users extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sortBy: "title",
      dir: "DESC",
      addUserOpen: false,
      bulk_users: {},
      bulk_users_all: false,
    };

    this.sortBy = this.sortBy.bind(this);
    this.sortCol = this.sortCol.bind(this);
    this.inputChange = this.inputChange.bind(this);
    this.createUser = this.createUser.bind(this);
    this.getArrs = this.getArrs.bind(this);
    this.getProfiles = this.getProfiles.bind(this);
    this.changeCheckbox = this.changeCheckbox.bind(this);
    this.findServerByUuid = this.findServerByUuid.bind(this);
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.setActiveUser = this.setActiveUser.bind(this);
    this.saveUser = this.saveUser.bind(this);
    this.findProfile = this.findProfile.bind(this);
    this.bulkSave = this.bulkSave.bind(this);
    this.deleteUser = this.deleteUser.bind(this);
    this.fileUpload = this.fileUpload.bind(this);
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
      eu_email: "",
      eu_role: "",
      eu_profile: "",
      eu_password: "",
      eu_enabled: false,
      bu_error: false,
      eu_error: false,
      custom_user_thumb: false,
    });
  }

  inputChange(e) {
    const target = e.target;
    const name = target.name;
    let value =
      target.type === "checkbox"
        ? target.checked
        : target.type === "file"
        ? target.files[0]
        : target.value;
    if (name === "eu_password")
      value = value.replace("*********", "").replace("********", "");
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
      this.props.msg({ message: "Radarr / Sonarr Configs loaded" });
    } catch (err) {
      this.props.msg({
        message: "Failed to load Radarr / Sonarr Configs",
        type: "error",
      });
      console.log(err);
      this.setState({
        r_servers: false,
        s_servers: false,
      });
    }
  }

  async createUser() {
    let username = this.state.cu_username;
    try {
      let newUser = await Api.createUser({
        id: `custom_${this.state.cu_username.replace(" ", "-")}`,
        username: this.state.cu_username,
        email: this.state.cu_email,
        password: this.state.cu_password,
        linked: this.state.cu_linked,
      });

      if (newUser.error) {
        this.props.msg({
          message: `${newUser.error}`,
          type: "error",
        });
      } else {
        this.props.msg({
          message: `User added ${username}`,
          type: "good",
        });
        this.closeModal("addUser");
        Api.allUsers();
      }
    } catch (err) {
      console.log(err);
      this.props.msg({
        message: `Failed to add user: ${username}`,
        type: "error",
      });
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

  findUser(id) {
    for (let u in this.props.api.users) {
      let user = this.props.api.users[u];
      if (user._id === id) {
        return user;
      }
    }
    return false;
  }

  setActiveUser(id) {
    let user = this.findUser(id);
    this.setState({
      activeUser: user,
      eu_email: user.email,
      eu_role: user.role ? user.role : "user",
      eu_profile: user.profile ? user.profile : "",
      eu_password: user.password === "removed" ? "*********" : "",
      eu_enabled: user.disabled ? false : true,
      thumb_path:
        process.env.NODE_ENV === "development"
          ? "http://localhost:7778/user/thumb/" + user.id
          : "/api/user/thumb/" + user.id,
    });
  }

  async getProfiles() {
    try {
      let profiles = await Api.getProfiles();
      this.setState({
        profiles: profiles,
      });
      this.props.msg({
        message: `Profiles Loaded`,
      });
    } catch (err) {
      console.log(err);
      this.props.msg({
        message: `Failed to Load Profiles`,
        type: "error",
      });
      this.setState({
        profiles: [],
      });
    }
  }

  async saveUser() {
    let userObj;
    let password =
      !this.state.eu_password || this.state.eu_password === ""
        ? false
        : this.state.eu_password;
    if (this.state.activeUser.custom && !password) {
      this.props.msg({
        message: "Custom users must have a password set",
        type: "error",
      });
      return;
    }

    userObj = {
      id: this.state.activeUser._id,
      email: this.state.eu_email,
      role: this.state.eu_role,
      profile: this.state.eu_profile,
      disabled: this.state.eu_enabled ? false : true,
    };

    if (password !== "*********" && password) {
      userObj.password = password;
    }

    if (!this.state.activeUser.custom && !password) {
      userObj.clearPassword = true;
    }

    let edited = await Api.editUser(userObj);

    if (edited.error) {
      this.setState({
        eu_error: edited.error,
      });
      this.props.msg({
        message: `Failed to Update User: ${this.state.activeUser.username}`,
        type: "error",
      });
    } else {
      this.props.msg({
        message: `User Updated: ${this.state.activeUser.username}`,
        type: "good",
      });
      this.closeModal("editUser");
      Api.allUsers();
    }
  }

  async deleteUser() {
    let del = await Api.deleteUser(this.state.activeUser);

    if (del.error) {
      this.setState({
        eu_error: del.error,
      });
      this.props.msg({
        message: `Failed to Delete User: ${this.state.activeUser.username}`,
        type: "error",
      });
    } else {
      this.props.msg({
        message: `User Deleted: ${this.state.activeUser.username}`,
        type: "good",
      });
      this.closeModal("editUser");
      Api.allUsers();
    }
  }

  findProfile(id) {
    for (let p in this.state.profiles) {
      let profile = this.state.profiles[p];
      if (profile._id === id) {
        return profile;
      }
    }
    return false;
  }

  async bulkSave() {
    let users = new Array();
    Object.keys(this.state.bulk_users).map((u) => {
      if (this.state.bulk_users[u]) {
        users.push(u);
      }
    });

    let upd = await Api.bulkEditUser({
      users: users,
      profile: this.state.bu_profile,
      enabled: this.state.bu_enabled,
    });

    if (upd.error) {
      this.setState({
        bu_error: upd.error,
      });
      this.props.msg({
        message: `Failed to Save Users`,
        type: "error",
      });
    } else {
      this.props.msg({
        message: `Users Bulk Updated`,
        type: "info",
      });
      this.closeModal("bulkUsers");
      Api.allUsers();
    }
  }

  async fileUpload(e) {
    e.preventDefault();
    var validExtensions = ["jpg", "png", "jpeg"]; //array of valid extensions
    var fileName = this.state.custom_user_thumb.name;
    var fileNameExt = fileName.substr(fileName.lastIndexOf(".") + 1);
    if (!validExtensions.includes(fileNameExt)) {
      this.props.msg({
        message:
          "Only these file types are accepted : " + validExtensions.join(", "),
        type: "error",
      });
      return;
    }
    try {
      const formData = new FormData();
      formData.append("thumb", this.state.custom_user_thumb);
      await Api.uploadThumb(formData, this.state.activeUser.id);
      this.setState({
        thumb_path:
          process.env.NODE_ENV === "development"
            ? "http://localhost:7778/user/thumb/" +
              this.state.activeUser.id +
              "?update=" +
              Date.now()
            : "/api/user/thumb/" +
              this.state.activeUser.id +
              "?update=" +
              Date.now(),
        custom_user_thumb: false,
      });
      document.getElementById("custom_thumb_upload").value = "";
      this.props.msg({
        message: `User Thumb Updated: ${this.state.activeUser.username}`,
        type: "good",
      });
    } catch (err) {
      this.props.msg({
        message: err,
        type: "error",
      });
      this.setState({
        custom_user_thumb: false,
      });
      document.getElementById("custom_thumb_upload").value = "";
    }
  }

  render() {
    let usersUnsorted = Object.values(this.props.api.users);
    let usersSorted = usersUnsorted.sort(this.sortBy);
    let usersAz = Object.values(usersUnsorted).sort(this.sortAz);
    return (
      <>
        <Modal
          title="Add User"
          open={this.state.addUserOpen}
          close={() => this.closeModal("addUser")}
          submit={this.createUser}
        >
          <p className="sub-title mb--1">New user</p>
          <input
            className="styled-input--input"
            placeholder="Username"
            type="text"
            name="cu_username"
            value={this.state.cu_username}
            onChange={this.inputChange}
          />
          <input
            className="styled-input--input"
            placeholder="Email"
            type="email"
            name="cu_email"
            value={this.state.cu_email}
            onChange={this.inputChange}
          />
          <p className="sub-title mb--1">Password</p>
          <input
            className="styled-input--input"
            placeholder="Password"
            type="text"
            name="cu_password"
            value={this.state.cu_password}
            onChange={this.inputChange}
          />
          <p className="sub-title mb--1">Link history to existing user</p>
          <div className="styled-input--select">
            <select
              name="cu_linked"
              value={this.state.cu_linked}
              onChange={this.inputChange}
            >
              <option value="">None</option>
              {Object.keys(usersAz).map((u) => {
                let user = usersAz[u];
                return (
                  <option
                    key={`user_linked_${user._id}`}
                    value={user.altId ? user.altId : user.id}
                  >
                    {user.title}
                  </option>
                );
              })}
            </select>
          </div>
          {this.state.cu_error ? <p>{this.state.cu_error}</p> : null}
        </Modal>

        <Modal
          title="Edit User"
          open={this.state.editUserOpen}
          close={() => this.closeModal("editUser")}
          submit={this.saveUser}
          delete={
            this.state.activeUser
              ? this.state.activeUser.custom
                ? this.deleteUser
                : false
              : false
          }
        >
          <p className="sub-title mb--1">
            Editing{" "}
            {this.state.activeUser ? this.state.activeUser.title : "user"}
          </p>
          <p className="sub-title mt--2 mb--1">Email</p>
          <input
            className="styled-input--input"
            placeholder="Email"
            type="email"
            name="eu_email"
            value={this.state.eu_email}
            onChange={this.inputChange}
          />
          <p className="sub-title mb--1">Role</p>
          <div className="styled-input--select">
            <select
              name="eu_role"
              value={this.state.eu_role}
              onChange={this.inputChange}
            >
              {this.state.activeUser ? (
                this.state.activeUser.role !== "admin" ? (
                  <>
                    <option value="user">User</option>
                    <option value="moderator">Moderator</option>
                  </>
                ) : (
                  <option value="admin">Admin</option>
                )
              ) : null}
            </select>
          </div>
          <p className="sub-title mb--1">Profile</p>
          <div className="styled-input--select">
            <select
              name="eu_profile"
              value={this.state.eu_profile}
              onChange={this.inputChange}
            >
              <option value="">Default</option>
              {this.state.profiles
                ? Object.keys(this.state.profiles).map((p) => {
                    let profile = this.state.profiles[p];
                    return (
                      <option
                        key={`user_profile_${profile._id}`}
                        value={profile._id}
                      >
                        {profile.name}
                      </option>
                    );
                  })
                : null}
            </select>
          </div>
          {this.state.activeUser ? (
            this.state.activeUser.role !== "admin" ? (
              <>
                <p className="sub-title mb--1">Enabled / Disabled</p>
                <label>
                  <input
                    type="checkbox"
                    checked={this.state.eu_enabled}
                    name="eu_enabled"
                    onChange={this.inputChange}
                  />{" "}
                  Enable this user
                </label>
              </>
            ) : null
          ) : null}
          <p className="sub-title mb--1">Password</p>
          {this.state.activeUser && !this.state.activeUser.custom ? (
            <p>
              <small>
                Warning: Custom passwords will disable a users Plex password. To
                disable custom password and revert to Plex password leave blank
              </small>
            </p>
          ) : null}
          <input
            className="styled-input--input"
            type="password"
            name="eu_password"
            value={this.state.eu_password}
            onChange={this.inputChange}
          />
          {this.state.activeUser ? (
            // this.state.activeUser.custom ? (
            <form
              onSubmit={this.fileUpload}
              encType="multipart/form-data"
              className="image-upload--wrap"
            >
              <div className="image-upload--inner">
                <div
                  className="image-upload--current"
                  style={{
                    backgroundImage: 'url("' + this.state.thumb_path + '")',
                  }}
                ></div>
                <input
                  type="file"
                  id="custom_thumb_upload"
                  name="custom_user_thumb"
                  onChange={this.inputChange}
                />
              </div>
              <button
                className={`image-upload--submit btn btn__square ${
                  this.state.custom_user_thumb ? "" : "disabled"
                }`}
              >
                Upload
              </button>
            </form>
          ) : // ) : null
          null}
          {this.state.eu_error ? <p>{this.state.eu_error}</p> : null}
        </Modal>

        <Modal
          title="Bulk Edit"
          open={this.state.bulkUsersOpen}
          close={() => this.closeModal("bulkUsers")}
          submit={this.bulkSave}
        >
          <p>
            You are editing all selected users, any changes will apply to them
            all
          </p>
          <p className="sub-title mt--2 mb--1">Profile</p>
          <div className="styled-input--select">
            <select
              name="bu_profile"
              value={this.state.bu_profile}
              onChange={this.inputChange}
            >
              <option value="">Default</option>
              {this.state.profiles
                ? Object.keys(this.state.profiles).map((p) => {
                    let profile = this.state.profiles[p];
                    return (
                      <option
                        key={`bulk_user_profile_${profile._id}`}
                        value={profile._id}
                      >
                        {profile.name}
                      </option>
                    );
                  })
                : null}
            </select>
          </div>

          <p className="sub-title mt--2 ">Enabled / Disabled</p>
          <p className="mb--1">
            <small>Note: admin cannot be disabled</small>
          </p>
          <label>
            <input
              type="checkbox"
              checked={this.state.bu_enabled}
              name="bu_enabled"
              onChange={this.inputChange}
            />{" "}
            Enable this user
          </label>
          {this.state.bu_error ? <p>{this.state.bu_error}</p> : null}
        </Modal>

        <Profiles
          addProfileOpen={this.state.addProfileOpen}
          closeModal={this.closeModal}
          s_servers={this.state.s_servers}
          r_servers={this.state.r_servers}
          inputChange={this.inputChange}
          findServerByUuid={this.findServerByUuid}
          openModal={this.openModal}
          profiles={this.state.profiles}
          getProfiles={this.getProfiles}
          findProfile={this.findProfile}
          msg={this.props.msg}
        />

        <section>
          <div className="title-btn">
            <p className="main-title">Users</p>
            <button
              className="btn btn__square"
              onClick={() => this.openModal("addUser")}
            >
              Add +
            </button>
            <button
              className={`btn btn__square ${
                Object.keys(this.state.bulk_users).length > 0 ? "" : "disabled"
              }`}
              onClick={() => {
                this.openModal("bulkUsers");
                this.setState({
                  bu_enabled: true,
                  bu_profile: "",
                });
              }}
            >
              Bulk edit
            </button>
          </div>
        </section>
        <section>
          <table className="generic-table generic-table__rounded">
            <thead>
              <tr>
                <th>
                  <input
                    className="checkbox-small"
                    type="checkbox"
                    checked={this.state.bulk_users_all}
                    name={"bulk_users_all"}
                    onChange={this.inputChange}
                  />
                </th>
                <th
                  className={`sortable ${
                    this.state.sortBy === "title" ? "active" : ""
                  } ${this.state.dir}`}
                  onClick={() => this.sortCol("title")}
                >
                  Title
                  <Arrow />
                </th>
                <th
                  className={`sortable ${
                    this.state.sortBy === "username" ? "active" : ""
                  } ${this.state.dir}`}
                  onClick={() => this.sortCol("username")}
                >
                  Username
                  <Arrow />
                </th>
                <th
                  className={`sortable ${
                    this.state.sortBy === "email" ? "active" : ""
                  } ${this.state.dir}`}
                  onClick={() => this.sortCol("email")}
                >
                  Email
                  <Arrow />
                </th>
                <th>Role</th>
                <th>Profile</th>
                <th>Active</th>
                <th>Last IP</th>
                <th>Last Login</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(usersSorted).map((u) => {
                let user = usersSorted[u];
                return (
                  <tr key={user._id}>
                    <td>
                      <input
                        className="checkbox-small user-checkbox"
                        data-type="bulk_users"
                        type="checkbox"
                        checked={
                          this.state.bulk_users
                            ? this.state.bulk_users[user._id]
                            : false
                        }
                        name={user._id}
                        onChange={this.changeCheckbox}
                      />
                    </td>
                    <td>
                      {user.title} {user.custom ? "(Custom)" : ""}
                    </td>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>{user.role ? user.role : "user"}</td>
                    <td>
                      {user.profile
                        ? this.findProfile(user.profile)
                          ? this.findProfile(user.profile).name
                          : "Removed"
                        : "default"}
                    </td>
                    <td>
                      <div className="table-icon">
                        {user.disabled ? <Close /> : <Check />}
                      </div>
                    </td>
                    <td>{user.lastIp ? user.lastIp : "n/a"}</td>
                    <td>
                      {user.lastLogin
                        ? `${new Date(user.lastLogin).toDateString()}`
                        : "n/a"}
                    </td>
                    <td>
                      <p
                        className="table-action"
                        onClick={() => {
                          this.openModal("editUser");
                          this.setActiveUser(user._id);
                        }}
                      >
                        Edit
                      </p>
                    </td>
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
