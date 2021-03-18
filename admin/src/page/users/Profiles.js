import React from "react";
import Api from "../../data/Api";

import Modal from "../../components/Modal";

class Profiles extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      np_name: "",
      np_quota: 0,
      np_auto_approve: false,
      np_auto_approve_tv: false,
      np_sonarr: {},
      np_radarr: {},
    };

    this.saveProfile = this.saveProfile.bind(this);

    this.setActiveProfile = this.setActiveProfile.bind(this);
    this.deleteProfile = this.deleteProfile.bind(this);
    this.inputChange = this.inputChange.bind(this);
    this.changeCheckbox = this.changeCheckbox.bind(this);
  }

  componentDidMount() {
    this.props.getProfiles();
  }

  setActiveProfile(id) {
    let profile = this.props.findProfile(id);
    this.setState({
      activeProfile: id,
      np_name: profile.name,
      np_quota: profile.quota,
      np_auto_approve: profile.autoApprove,
      np_auto_approve_tv: profile.autoApproveTv,
      np_sonarr: profile.sonarr,
      np_radarr: profile.radarr,
      np_default: profile.isDefault,
    });
  }

  async saveProfile() {
    try {
      await Api.saveProfile({
        id: this.state.activeProfile,
        name: this.state.np_name,
        quota: this.state.np_quota,
        radarr: this.state.np_radarr,
        sonarr: this.state.np_sonarr,
        autoApprove: this.state.np_auto_approve,
        autoApproveTv: this.state.np_auto_approve_tv,
        isDefault: this.state.np_default,
      });
      this.props.msg({
        message: `Profile Saved: ${this.state.np_name}`,
        type: "good",
      });
      this.props.closeModal("addProfile");
      this.props.getProfiles();
    } catch {
      this.props.msg({
        message: `Failed to Save Profile: ${this.state.np_name}`,
        type: "error",
      });
    }
  }

  async deleteProfile() {
    try {
      await Api.deleteProfile({
        id: this.state.activeProfile,
        name: this.state.np_name,
        quota: this.state.np_quota,
        radarr: this.state.np_radarr,
        sonarr: this.state.np_sonarr,
        autoApprove: this.state.np_auto_approve,
        autoApproveTv: this.state.np_auto_approve_tv,
        isDefault: this.state.np_default,
      });
      this.props.msg({
        message: `Profile Deleted: ${this.state.np_name}`,
        type: "good",
      });
      this.props.closeModal("addProfile");
      this.props.getProfiles();
      Api.allUsers();
    } catch {
      this.props.msg({
        message: `Failed to Delete Profile: ${this.state.np_name}`,
        type: "error",
      });
    }
  }

  search(key, value, myArray) {
    for (var i = 0; i < myArray.length; i++) {
      if (myArray[i][key] === value) {
        return myArray[i];
      }
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

  changeCheckbox(e) {
    const target = e.target;
    const name = target.name;
    let value = target.checked;
    let type = target.dataset.type;

    this.setState({
      [type]: {
        ...this.state[type],
        [name]: value,
      },
    });
  }

  render() {
    return (
      <>
        <Modal
          title="Add Profile"
          open={this.props.addProfileOpen}
          close={() => {
            this.props.closeModal("addProfile");
            this.setState({
              np_name: "",
              np_auto_approve: false,
              np_quota: 0,
              np_radarr: [],
              np_sonarr: [],
              activeProfile: false,
              activeProfileTv: false,
            });
          }}
          submit={this.saveProfile}
          delete={this.state.activeProfile ? this.deleteProfile : false}
        >
          <p className="sub-title mb--1">New profile</p>
          <input
            className="styled-input--input"
            placeholder="Name"
            type="text"
            name="np_name"
            value={this.state.np_name}
            onChange={this.inputChange}
          />
          <p className="sub-title mb--1">Sonarr</p>
          {this.props.s_servers ? (
            this.props.s_servers.map((server) => {
              return (
                <label key={server.uuid}>
                  <input
                    data-type="np_sonarr"
                    type="checkbox"
                    checked={
                      this.state.np_sonarr
                        ? this.state.np_sonarr[server.uuid]
                        : false
                    }
                    name={server.uuid}
                    onChange={this.changeCheckbox}
                  />{" "}
                  {server.title}
                </label>
              );
            })
          ) : (
            <p>No Sonarr Servers</p>
          )}
          <p className="sub-title mb--1">Radarr</p>
          {this.props.r_servers ? (
            this.props.r_servers.map((server) => {
              return (
                <label key={server.uuid}>
                  <input
                    data-type="np_radarr"
                    type="checkbox"
                    checked={
                      this.state.np_radarr
                        ? this.state.np_radarr[server.uuid]
                        : false
                    }
                    name={server.uuid}
                    onChange={this.changeCheckbox}
                  />{" "}
                  {server.title}
                </label>
              );
            })
          ) : (
            <p>No Radarr Servers</p>
          )}
          <p className="sub-title mb--1">Auto Approve Movies</p>
          <label>
            <input
              type="checkbox"
              name="np_auto_approve"
              checked={this.state.np_auto_approve}
              onChange={this.inputChange}
            />{" "}
            Enabled
          </label>
          <p className="sub-title mb--1">Auto Approve TV</p>
          <label>
            <input
              type="checkbox"
              name="np_auto_approve_tv"
              checked={this.state.np_auto_approve_tv}
              onChange={this.inputChange}
            />{" "}
            Enabled
          </label>
          <p className="sub-title mb--1">Quota</p>
          <p>
            <small>Quota of requests per week. For no limit leave at 0</small>
          </p>
          <input
            className="styled-input--input"
            type="number"
            name="np_quota"
            value={this.state.np_quota}
            onChange={this.inputChange}
          />
          <p className="sub-title mb--1">Set as default</p>
          <label>
            <input
              type="checkbox"
              name="np_default"
              checked={this.state.np_default}
              onChange={this.inputChange}
            />{" "}
            Enabled
          </label>
        </Modal>
        <section>
          <div className="title-btn">
            <p className="main-title">User Profiles</p>
            <button
              className="btn btn__square"
              onClick={() => {
                this.props.openModal("addProfile");
                this.setState({ activeProfile: false });
              }}
            >
              Add +
            </button>
          </div>
        </section>
        <section>
          <p className="mb--2">
            User profiles determine what should happen when a user makes a
            request. If using Sonarr / Radarr you can pick which servers the
            request is sent to. You can also choose to allow auto approval for
            certain users.
          </p>
          <table className="generic-table generic-table__rounded">
            <thead>
              <tr>
                <th>Name</th>
                <th>Default</th>
                <th>Sonarr</th>
                <th>Radarr</th>
                <th>Auto Approve Movie</th>
                <th>Auto Approve TV</th>
                <th>Quota (per week)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Default</td>
                <td>
                  {this.props.profiles
                    ? this.search("isDefault", true, this.props.profiles)
                      ? "No"
                      : "Yes"
                    : "Yes"}
                </td>
                <td>All</td>
                <td>All</td>
                <td>No</td>
                <td>No</td>
                <td>∞</td>
                <td>None</td>
              </tr>
              {this.props.profiles && this.props.s_servers
                ? this.props.profiles.map((profile) => {
                    let sActive = false;
                    let rActive = false;
                    return (
                      <tr key={profile._id}>
                        <td>{profile.name}</td>
                        <td>{profile.isDefault ? "Yes" : "No"}</td>
                        <td>
                          {profile.sonarr
                            ? Object.keys(profile.sonarr).length > 0
                              ? Object.keys(profile.sonarr).map((s) => {
                                  if (!profile.sonarr[s]) return;
                                  sActive = true;
                                  let server = this.props.findServerByUuid(
                                    s,
                                    "s_servers"
                                  );
                                  let serverName = server
                                    ? server.title
                                    : "Not Found";
                                  return (
                                    <span
                                      key={`${profile._id}_${s}`}
                                      className="requests--status requests--status__sonarr"
                                    >
                                      {serverName}
                                    </span>
                                  );
                                })
                              : null
                            : null}
                          {!sActive ? "None" : null}
                        </td>
                        <td>
                          {profile.radarr
                            ? Object.keys(profile.radarr).length > 0
                              ? Object.keys(profile.radarr).map((r) => {
                                  if (!profile.radarr[r]) return null;
                                  rActive = true;
                                  let server = this.props.findServerByUuid(
                                    r,
                                    "r_servers"
                                  );
                                  let serverName = server
                                    ? server.title
                                    : "Not Found";

                                  return (
                                    <span
                                      key={`${profile._id}_${r}`}
                                      className="requests--status requests--status__radarr"
                                    >
                                      {serverName}
                                    </span>
                                  );
                                })
                              : null
                            : null}
                          {!rActive ? "None" : null}
                        </td>
                        <td>{profile.autoApprove ? "Yes" : "No"}</td>
                        <td>{profile.autoApproveTv ? "Yes" : "No"}</td>
                        <td>{profile.quota === 0 ? "∞" : profile.quota}</td>
                        <td>
                          <p
                            className="table-action"
                            onClick={() => {
                              this.props.openModal("addProfile");

                              this.setActiveProfile(profile._id);
                            }}
                          >
                            Edit
                          </p>
                        </td>
                      </tr>
                    );
                  })
                : null}
            </tbody>
          </table>
        </section>
      </>
    );
  }
}

export default Profiles;
