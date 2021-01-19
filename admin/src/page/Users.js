import React from "react";
import Api from "../data/Api";

import Modal from "../components/Modal";

import { ReactComponent as Arrow } from "../assets/svg/arrow-left.svg";

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
  }
  componentDidMount() {
    let page = document.querySelectorAll(".page-wrap")[0];
    page.scrollTop = 0;
    window.scrollTo(0, 0);
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

  render() {
    let usersUnsorted = Object.values(this.props.api.users);
    let usersSorted = usersUnsorted.sort(this.sortBy);
    let usersAz = Object.values(usersUnsorted).sort(this.sortAz);
    return (
      <>
        <Modal title="Add User" open={this.state.addUserOpen} close={() => this.closeModal("addUser")}>
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
                  <option key={`user_linked_${user._id}`} value={user.id}>
                    {user.title}
                  </option>
                );
              })}
            </select>
          </div>
        </Modal>
        <section>
          <p className="main-title">User Roles</p>
        </section>
        <section></section>
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
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(usersSorted).map((u) => {
                let user = usersSorted[u];
                return (
                  <tr key={user._id}>
                    <td>{user.title}</td>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
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
