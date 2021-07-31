import React from "react";
import { ReactComponent as Add } from "../assets/svg/plus-circle.svg";
import { ReactComponent as Minus } from "../assets/svg/minus-circle.svg";

class FilterAction extends React.Component {
  render() {
    const fs = this.props.type === "movie_filters" ? "mf" : "tf";
    const data = Array.isArray(this.props.data)
      ? this.props.data
      : [this.props.data];
    // const data = this.props.data;
    if (!Array.isArray(data)) return null;
    return (
      <>
        <div className="filter--comparison">THEN</div>
        {data.map((item, i) => {
          return (
            <div
              key={`action__${this.props.item}__${i}`}
              data-key={`action__${this.props.item}__${i}`}
              className="filter--action"
            >
              <div className="filter--row--item">
                <p className="filter--row--item--title">Server</p>
                <div className="select-wrap">
                  <select
                    data-type={this.props.type}
                    data-row="action"
                    data-action-row={i}
                    data-item={this.props.item}
                    name="server"
                    onChange={this.props.inputChange}
                    value={item.server}
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
                    data-action-row={i}
                    data-item={this.props.item}
                    name="path"
                    onChange={this.props.inputChange}
                    value={item.path}
                  >
                    {item.server ? (
                      <>
                        <option value="">Please Select</option>
                        {this.props.settings[item.server] &&
                        this.props.settings[item.server].paths &&
                        this.props.settings[item.server].paths.length > 0 ? (
                          this.props.settings[item.server].paths.map(
                            (path, i) => {
                              return (
                                <option
                                  key={`${fs}__${this.props.item}__p_${i}`}
                                  value={path.path}
                                >
                                  {path.path}
                                </option>
                              );
                            }
                          )
                        ) : (
                          <option value="">Loading...</option>
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
                    data-action-row={i}
                    data-item={this.props.item}
                    name="profile"
                    onChange={this.props.inputChange}
                    value={item.profile}
                  >
                    {item.server &&
                    this.props.settings[item.server] &&
                    this.props.settings[item.server].profiles ? (
                      <>
                        <option value="">Please Select</option>
                        {this.props.settings[item.server].profiles.map(
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
                <div className="select-wrap">
                  <select
                    data-type={this.props.type}
                    data-row="action"
                    data-action-row={i}
                    data-item={this.props.item}
                    name="tag"
                    onChange={this.props.inputChange}
                    value={item.tag}
                  >
                    {item.server && this.props.settings[item.server] ? (
                      this.props.settings[item.server].tags ? (
                        <>
                          <option value="">Don&apos;t set tag</option>
                          {this.props.settings[item.server].tags.map((tag) => {
                            return (
                              <option
                                value={tag.id}
                                key={`${fs}__${this.props.item}__pf_${tag.id}`}
                              >
                                {tag.label}
                              </option>
                            );
                          })}
                        </>
                      ) : (
                        <option value="">No tags</option>
                      )
                    ) : (
                      <option value="">Choose Server</option>
                    )}
                  </select>
                </div>
              </div>
              {this.props.type === "tv_filters" ? (
                <div className="filter--row--item">
                  <p className="filter--row--item--title">Type</p>
                  <div className="select-wrap">
                    <select
                      data-type={this.props.type}
                      data-row="action"
                      data-action-row={i}
                      data-item={this.props.item}
                      name="type"
                      onChange={this.props.inputChange}
                      value={item.type}
                    >
                      {item.server && this.props.settings[item.server] ? (
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
              {i > 0 ? (
                <div
                  className="filter--row--remove"
                  onClick={() =>
                    this.props.removeAction(this.props.type, this.props.item, i)
                  }
                >
                  <Minus />
                </div>
              ) : null}

              <div
                className={`filter--row--add ${i > 0 ? "nm" : ""}`}
                onClick={() =>
                  this.props.addAction(this.props.type, this.props.item)
                }
              >
                <Add />
              </div>
            </div>
          );
        })}
      </>
    );
  }
}

export default FilterAction;
