import React from "react";

class FilterAction extends React.Component {
  render() {
    const fs = this.props.type === "movie_filters" ? "mf" : "tf";
    return (
      <>
        <div className="filter--comparison">THEN</div>
        <div className="filter--action">
          <div className="filter--row--item">
            <p className="filter--row--item--title">Server</p>
            <div className="select-wrap">
              <select
                data-type={this.props.type}
                data-row="action"
                data-item={this.props.item}
                name="server"
                onChange={this.props.inputChange}
                value={this.props.data.server}
              >
                {this.props.servers === "loading" ? (
                  <option value="">Loading...</option>
                ) : this.props.servers.length > 0 ? (
                  <>
                    <option value="">Please Select</option>
                    {this.props.servers.map((server, i) => {
                      return (
                        <option
                          key={`${fs}__${this.props.item}__s_${i}`}
                          value={server.uuid}
                        >
                          {server.title}
                        </option>
                      );
                    })}
                  </>
                ) : (
                  <option value="">No servers available</option>
                )}
              </select>
            </div>
          </div>
          <div className="filter--row--item">
            <p className="filter--row--item--title">Path</p>
            <div className="select-wrap">
              <select
                data-type={this.props.type}
                data-row="action"
                data-item={this.props.item}
                name="path"
                onChange={this.props.inputChange}
                value={this.props.data.path}
              >
                {this.props.data.server &&
                this.props.settings[this.props.data.server] ? (
                  <>
                    <option value="">Please Select</option>
                    {this.props.settings[this.props.data.server].paths.map(
                      (path, i) => {
                        return (
                          <option
                            key={`${fs}__${this.props.item}__p_${i}`}
                            value={path.id}
                          >
                            {path.path}
                          </option>
                        );
                      }
                    )}
                  </>
                ) : (
                  <option value="">Choose Server</option>
                )}
              </select>
            </div>
          </div>
          <div className="filter--row--item">
            <p className="filter--row--item--title">Profile</p>
            <div className="select-wrap">
              <select
                data-type={this.props.type}
                data-row="action"
                data-item={this.props.item}
                name="profile"
                onChange={this.props.inputChange}
                value={this.props.data.profile}
              >
                {this.props.data.server &&
                this.props.settings[this.props.data.server] ? (
                  <>
                    <option value="">Please Select</option>
                    {this.props.settings[this.props.data.server].profiles.map(
                      (profile, i) => {
                        return (
                          <option
                            key={`${fs}__${this.props.item}__pf_${i}`}
                            value={profile.id}
                          >
                            {profile.name}
                          </option>
                        );
                      }
                    )}
                  </>
                ) : (
                  <option value="">Choose Server</option>
                )}
              </select>
            </div>
          </div>
          <div className="filter--row--item">
            <p className="filter--row--item--title">Tag</p>
            <input
              data-type={this.props.type}
              data-row="action"
              data-item={this.props.item}
              name="tag"
              onChange={this.props.inputChange}
              value={!this.props.data.tag ? "" : this.props.data.tag}
              type="text"
            />
          </div>
          {this.props.type === "tv_filters" ? (
            <div className="filter--row--item">
              <p className="filter--row--item--title">Type</p>
              <div className="select-wrap">
                <select
                  data-type={this.props.type}
                  data-row="action"
                  data-item={this.props.item}
                  name="type"
                  onChange={this.props.inputChange}
                  value={this.props.data.type}
                >
                  {this.props.data.server &&
                  this.props.settings[this.props.data.server] ? (
                    <>
                      <option value="standard">Standard</option>
                      <option value="daily">Daily</option>
                      <option value="anime">Anime</option>
                    </>
                  ) : (
                    <option value="">Choose Server</option>
                  )}
                </select>
              </div>
            </div>
          ) : null}
        </div>
      </>
    );
  }
}

export default FilterAction;
