import React from "react";
import Api from "../data/Api";

class Users extends React.Component {
  componentDidMount() {
    let page = document.querySelectorAll(".page-wrap")[0];
    page.scrollTop = 0;
    window.scrollTo(0, 0);
  }
  render() {
    return (
      <>
        <section>
          <p className="main-title">User Roles</p>
        </section>
        <section></section>
        <section>
          <p className="main-title">Users</p>
        </section>
        <section>
          <table className="generic-table generic-table__rounded">
            <thead>
              <tr>
                <th>Title</th>
                <th>Username</th>
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(this.props.api.users).map((u) => {
                let user = this.props.api.users[u];
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
