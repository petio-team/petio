import React from "react";
import Api from "../../data/Api";

import { ReactComponent as Close } from "../../assets/svg/close.svg";

class Modal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      profiles: false,
      paths: false,
    };

    this.getSettings = this.getSettings.bind(this);
  }
  componentDidMount() {
    if (this.props.edit) {
      this.getSettings();
    }
  }

  async getSettings() {
    try {
      let settings = this.props.type === "radarr" ? await Api.radarrOptions(this.props.state.uuid) : await Api.sonarrOptions(this.props.state.uuid);
      if (settings.profiles.error || settings.paths.error) {
        return;
      }
      this.setState({
        profiles: settings.profiles,
        paths: settings.paths,
      });
    } catch {
      return;
    }
  }

  render() {
    console.log(this.state.profiles);
    return (
      <div className={`modal--wrap ${this.props.open ? "active" : ""}`}>
        <div className="modal--inner">
          <div className="modal--top">
            <h3>{this.props.title}</h3>
          </div>
          <div className="modal--main">
            <label>Title</label>
            <input type="text" name="title" value={this.props.state.title} onChange={this.props.inputChange} />
            <label>Protocol</label>
            <div className="select-wrap">
              <select name="protocol" value={this.props.state.protocol} onChange={this.props.inputChange}>
                <option value="http">HTTP</option>
                <option value="https">HTTPS</option>
              </select>
            </div>
            <label>Host</label>
            <input type="text" name="host" value={this.props.state.host} onChange={this.props.inputChange} />
            <label>Port</label>
            <input type="number" name="port" value={this.props.state.port} onChange={this.props.inputChange} />
            <label>URL Base</label>
            <input type="text" name="base" value={this.props.state.base} onChange={this.props.inputChange} />
            <label>API Key</label>
            <input type="text" name="apikey" value={this.props.state.apikey} onChange={this.props.inputChange} />
            {this.props.edit && this.state.profiles ? (
              <>
                <label>Profile</label>
                <div className="select-wrap">
                  <select name="profile" value={this.props.state.profile} onChange={this.props.inputChange}>
                    {this.state.profiles ? (
                      <>
                        <option value="">Choose an option</option>
                        {this.state.profiles.map((item) => {
                          return (
                            <option key={`sp__${item.id}`} value={item.id}>
                              {item.name}
                            </option>
                          );
                        })}
                      </>
                    ) : (
                      <option value="">Loading Profiles</option>
                    )}
                  </select>
                </div>
              </>
            ) : null}
            {this.props.edit && this.state.paths ? (
              <>
                <label>Path</label>
                <div className="select-wrap">
                  <select name="path" value={this.props.state.path} onChange={this.props.inputChange}>
                    {this.state.paths ? (
                      <>
                        <option value="">Choose an option</option>
                        {this.state.paths.map((item) => {
                          return (
                            <option key={`spp__${item.id}`} value={item.id}>
                              {item.path}
                            </option>
                          );
                        })}
                      </>
                    ) : (
                      <option value="">Loading Paths</option>
                    )}
                  </select>
                </div>
              </>
            ) : null}
            {this.props.state.path && this.props.state.profile ? (
              <div className="checkbox-wrap mb--2">
                <input type="checkbox" name="active" checked={this.props.state.active} onChange={this.props.inputChange} />
                <p>Enabled</p>
              </div>
            ) : null}
            <button className="btn btn__square" onClick={this.props.saveServer}>
              Save
            </button>
            <button className="btn btn__square bad" style={{ marginLeft: "10px" }} onClick={this.props.closeWizard}>
              Cancel
            </button>
            <button className="btn btn__square bad delete-modal" onClick={this.props.deleteServer}>
              Delete
            </button>
            <input type="hidden" value={this.props.state.uuid} readOnly={true} />
          </div>
        </div>
      </div>
    );
  }
}

export default Modal;
