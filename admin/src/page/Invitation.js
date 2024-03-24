import React from "react";
import moment from "moment";
import { withRouter } from "react-router-dom/cjs/react-router-dom.min";
import Modal from "../components/Modal";
import Api from "../data/Api";

const initialInvitationForm = {
  code: "",
  email: "",
  expireOn: "expire1Day",
  maxUses: 1,
  libraries: [],
  downloadPermitted: "",
};

class Invitation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sortBy: "title",
      dir: "DESC",
      addInvitOpen: false,
      invitations: [],
      plexLibraries: [],
      plexLibrariesLoading: true,
      // invitation form
      invForm: initialInvitationForm,
      urlRedirection: "",
      urlRedirectionEdit: "",
    };

    this.addInvitation = this.addInvitation.bind(this);
    this.getUrlRedirection = this.getUrlRedirection.bind(this);
    this.updateUrlRedirection = this.updateUrlRedirection.bind(this);
  }

  componentDidMount() {
    this.getPlexLibraries();
    this.getInvitations();
    this.getUrlRedirection();
  }

  async getPlexLibraries() {
    const libraries = await Api.getPlexLibraries();

    this.setState({ plexLibraries: libraries || [] });
  }

  async getInvitations() {
    try {
      const invitations = await Api.getInvitations();
      this.setState({ invitations });
    } catch (error) {
      this.props.msg({
        message: error.message,
        type: error.level,
      });
    }
  }

  async addInvitation() {
    try {
      const invitation = {
        _id: this.state.invForm._id,
        email: this.state.invForm.email,
        invitCode: this.state.invForm.code,
        expireOn:
          this.getInvitationExpireOnDate(this.state.invForm.expireOn) ||
          undefined,
        maxUses: this.state.invForm.maxUses || undefined,
        libraries: this.state.invForm.libraries,
        downloadPermitted: this.state.invForm.downloadPermitted,
        invitedBy: this.props.user.current._id,
      };

      const newInvitation = await Api[
        invitation._id ? "updateInvitation" : "addInvitation"
      ](invitation);

      this.setState((state) => ({
        invForm: initialInvitationForm,
        invitations: [
          newInvitation,
          ...state.invitations.filter((i) => i._id !== newInvitation._id),
        ],
        addInvitOpen: false,
      }));
    } catch (error) {
      console.error(error);
    }
  }

  async deleteInvitation(id) {
    try {
      await Api.deleteInvitation(id);
      this.setState((state) => ({
        invitations: state.invitations.filter((i) => i._id !== id),
      }));
    } catch (error) {
      console.error(error);
    }
  }

  async getUrlRedirection() {
    try {
      const { urlRedirection } = await Api.getUrlRedirection();
      this.setState({
        urlRedirection: urlRedirection || "",
        urlRedirectionEdit: urlRedirection || "",
      });
    } catch (error) {
      console.error(error);
      this.props.msg({
        message: error.message,
        type: error.level,
      });
    }
  }

  async updateUrlRedirection() {
    try {
      const { urlRedirection } = await Api.updateUrlRedirection(
        this.state.urlRedirectionEdit
      );
      this.setState({
        urlRedirection: urlRedirection || "",
        urlRedirectionEdit: urlRedirection || "",
      });
    } catch (error) {
      console.error(error);
      this.props.msg({
        message: error.message,
        type: error.level,
      });
    }
  }

  openModal(id, invitation) {
    if (invitation) {
      this.setState({
        invForm: {
          _id: invitation._id,
          code: invitation.invitCode || this.generateInvitationCode(),
          email: invitation.email || "",
          expireOn: invitation.expireOn || "",
          maxUses: invitation.maxUses || "",
          libraries: invitation.libraries.map((l) => l.uuid),
          downloadPermitted: !!invitation.downloadPermitted,
        },
      });
    }

    this.setState({
      [`${id}Open`]: true,
    });
  }

  closeModal(id) {
    this.setState({
      [`${id}Open`]: false,
    });
  }

  generateInvitationCode() {
    let code = "";
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    for (let i = 0; i < 6; i++)
      code += possible.charAt(Math.floor(Math.random() * possible.length));

    if (this.state.invitations.find((i) => i.code === code))
      return this.generateInvitationCode();

    return code;
  }

  getInvitationExpireOnDate(expireOn) {
    switch (expireOn) {
      case "expire1Day":
        return new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
      case "expire1Week":
        return new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000);
      case "expire1Month":
        return new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000);
      case "expire6Months":
        return new Date(new Date().getTime() + 6 * 30 * 24 * 60 * 60 * 1000);
      case "expire1Year":
        return new Date(new Date().getTime() + 365 * 24 * 60 * 60 * 1000);
      case "expireNever":
        return null;
      default:
        return null;
    }
  }

  inputChange(field, value) {
    this.setState((state) => ({
      invForm: { ...state.invForm, [field]: value },
    }));
  }

  render() {
    return (
      <>
        <section>
          <h1 className="title-btn">
            <p className="main-title">Invitations</p>
            <button
              className="btn btn__square"
              onClick={() => {
                this.openModal("addInvit");
                this.inputChange("code", this.generateInvitationCode());
              }}
            >
              Add +
            </button>
            <div className="input-button-group-with-label">
              <label htmlFor="urlRedirection">
                URL redirection after invitation acceptance
              </label>
              <form onSubmit={this.updateUrlRedirection}>
                <div className="input-button-group">
                  <input
                    id="urlRedirection"
                    value={this.state.urlRedirectionEdit}
                    style={{ width: "400px" }}
                    className="styled-input--input"
                    placeholder="URL redirection after invitation acceptance"
                    onChange={(e) =>
                      this.setState({ urlRedirectionEdit: e.target.value })
                    }
                  />
                  <button
                    className="btn btn__square"
                    type="submit"
                    disabled={
                      this.state.urlRedirection ===
                      this.state.urlRedirectionEdit
                    }
                  >
                    ✔
                  </button>
                </div>
              </form>
            </div>
          </h1>
        </section>

        <table className="generic-table generic-table__rounded">
          <thead>
            <tr>
              <th>Code</th>
              <th>Invited by</th>
              <th>To</th>
              <th>Accepted by</th>
              <th>Uses</th>
              <th>Expiration</th>
              <th>Created date</th>
              <th>Libraries</th>
              <th>Can download</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {this.state.invitations
              .sort((a, b) => (b.invitedOn < a.invitedOn ? -1 : 1))
              .map((invitation) => {
                const {
                  invitCode,
                  email,
                  invitedBy,
                  acceptedBy,
                  libraries,
                  maxUses,
                  used,
                  invitedOn,
                  expireOn,
                  downloadPermitted,
                  _id,
                } = invitation;

                return (
                  <tr key={_id}>
                    <td>{invitCode}</td>
                    <td>{invitedBy.email}</td>
                    <td>{email || "Anyone"}</td>
                    <td style={{ whiteSpace: "break-spaces" }}>
                      {acceptedBy?.map((user) => user.email).join("\n")}
                    </td>
                    <td>{!maxUses ? "Unlimited" : `${used}/${maxUses}`}</td>
                    <td>
                      {!expireOn ? "Unlimited" : moment(expireOn).fromNow()}
                    </td>
                    <td>{moment(invitedOn).fromNow()}</td>
                    <td style={{ whiteSpace: "break-spaces" }}>
                      {libraries.map((l) => l.title).join("\n")}
                    </td>
                    <td>{downloadPermitted ? "✔" : "✘"}</td>
                    <td>
                      <p
                        className="table-action"
                        onClick={() => {
                          this.openModal("addInvit", invitation);
                        }}
                      >
                        Edit
                      </p>
                      <p
                        className="table-action"
                        onClick={() => {
                          this.deleteInvitation(invitation._id);
                        }}
                      >
                        Delete
                      </p>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>

        <Modal
          title={`${this.state.invForm._id ? "Edit" : "Create"} Invitation`}
          open={this.state.addInvitOpen}
          close={() => this.closeModal("addInvit")}
          submit={this.addInvitation}
        >
          <p className="sub-title mt--1">Code</p>
          <div className="disabled">
            <input
              className="styled-input--select disabled"
              placeholder="Code"
              type="text"
              name="code"
              value={this.state.invForm.code}
              disabled
            />
          </div>
          <p className="sub-title mt--1">Send to</p>
          <input
            className="styled-input--input"
            placeholder="Email (leave blank to don't send mail)"
            type="email"
            name="email"
            value={this.state.invForm.email}
            onChange={(e) => this.inputChange("email", e.target.value)}
          />
          <p className="sub-title mt--1">Invitation duration</p>
          <div className="styled-input--select">
            <select
              id="expireOn"
              name="expireOn"
              value={this.state.invForm.expireOn}
              onChange={(e) => this.inputChange("expireOn", e.target.value)}
            >
              <option value="expire1Day">1 Day</option>
              <option value="expire1Week">1 Week</option>
              <option value="expire1Month">1 Month</option>
              <option value="expire6Months">6 Months</option>
              <option value="expire1Year">1 Year</option>
              <option value="expireNever">Never</option>
            </select>
          </div>
          <p className="sub-title mb--1">Max invitations with this code</p>
          <input
            className="styled-input--input"
            placeholder="Number of uses (leave blank for unlimited)"
            type="number"
            name="maxUses"
            value={this.state.invForm.maxUses}
            onChange={(e) =>
              this.inputChange(
                "maxUses",
                e.target.value === 0 ? undefined : e.target.value
              )
            }
          />
          <p className="sub-title mb--1">Libraries</p>
          <select
            className="styled-input--select"
            name="libraries"
            multiple
            value={this.state.invForm.libraries}
            onChange={(e) => {
              console.dir(
                [...e.target.children]
                  .filter((o) => o.selected)
                  .map((o) => o.value)
              );
              this.inputChange(
                "libraries",
                [...e.target.children]
                  .filter((o) => o.selected)
                  .map((o) => o.value)
              );
            }}
          >
            {this.state.plexLibraries.map((library) => {
              const selected = this.state.invForm.libraries.includes(
                library.uuid
              );
              return (
                <option key={library.uuid} value={library.uuid}>
                  {selected ? "✔ " : ""}
                  {library.title}
                </option>
              );
            })}
          </select>
          <div className="row">
            <input
              id="downloadPermitted"
              style={{ marginRight: 10 }}
              className="styled-input--input"
              type="checkbox"
              name="downloadPermitted"
              checked={this.state.invForm.downloadPermitted}
              onChange={(e) =>
                this.inputChange("downloadPermitted", e.target.checked)
              }
            />
            <label htmlFor="downloadPermitted" className="sub-title mb--1">
              Download permitted
            </label>
          </div>
        </Modal>
      </>
    );
  }
}

export default withRouter(Invitation);
