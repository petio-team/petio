import React from 'react';

import { ReactComponent as Minus } from '../assets/svg/minus-circle.svg';
import { ReactComponent as Add } from '../assets/svg/plus-circle.svg';

class FilterAction extends React.Component {
  render() {
    const fs = this.props.type === 'movie_filters' ? 'mf' : 'tf';
    const data = Array.isArray(this.props.data)
      ? this.props.data
      : [this.props.data];

    if (!Array.isArray(data)) return null;
    return (
      <>
        <div className="filter--comparison">THEN</div>
        {data.map((item, i) => {
          let server = {};
          if (this.props.servers) {
            server = this.props.servers.filter((s) => s.id === item.server)[0];
          }

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
                    {this.props.servers === 'loading' ? (
                      <option value="">Loading...</option>
                    ) : this.props.servers.length > 0 ? (
                      <>
                        <option value="">Please Select</option>
                        {this.props.servers.map((server, i) => {
                          return (
                            <option
                              key={`${fs}__${this.props.item}__s_${i}`}
                              value={server.id}
                            >
                              {server.name}
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
                    {server ? (
                      <>
                        <option value="">Please Select</option>
                        {server.paths &&
                          server.paths.length > 0 ? (
                          server.paths.map(
                            (path, i) => {
                              return (
                                <option
                                  key={`${fs}__${this.props.item}__p_${i}`}
                                  value={path.id}
                                >
                                  {path.path}
                                </option>
                              );
                            },
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
                    {server ? (
                      <>
                        <option value="">Please Select</option>
                        {server.profiles &&
                          server.profiles.length > 0 ? (
                          server.profiles.map(
                            (profile, i) => {
                              return (
                                <option
                                  key={`${fs}__${this.props.item}__pf_${i}`}
                                  value={profile.id}
                                >
                                  {profile.name}
                                </option>
                              );
                            },
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
                <p className="filter--row--item--title">Language</p>
                <div className="select-wrap">
                  <select
                    data-type={this.props.type}
                    data-row="action"
                    data-action-row={i}
                    data-item={this.props.item}
                    name="language"
                    onChange={this.props.inputChange}
                    value={item.language}
                  >
                    {server ? (
                      <>
                        <option value="">Please Select</option>
                        {server.languages &&
                          server.languages.length > 0 ? (
                          server.languages.map(
                            (language, i) => {
                              return (
                                <option
                                  key={`${fs}__${this.props.item}__l_${i}`}
                                  value={language.id}
                                >
                                  {language.name}
                                </option>
                              );
                            },
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
                <p className="filter--row--item--title">
                  {this.props.type === 'movie_filters' ? 'Minimum Availability' : 'Series Type'}
                </p>
                <div className="select-wrap">
                  <select
                    data-type={this.props.type}
                    data-row="action"
                    data-action-row={i}
                    data-item={this.props.item}
                    name="availability"
                    onChange={this.props.inputChange}
                    value={item.availability}
                  >
                    {server ? (
                      <>
                        <option value="">Please Select</option>
                        {server.availabilities &&
                          server.availabilities.length > 0 ? (
                          server.availabilities.map(
                            (availability, i) => {
                              return (
                                <option
                                  key={`${fs}__${this.props.item}__a_${i}`}
                                  value={availability.id}
                                >
                                  {this.props.type === 'movie_filters' ? availability.name : availability.status}
                                </option>
                              );
                            },
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
                    {server ? (
                      <>
                        <option value="">Please Select</option>
                        {server.tags &&
                          server.tags.length > 0 ? (
                          server.tags.map(
                            (tag, i) => {
                              return (
                                <option
                                  key={`${fs}__${this.props.item}__t_${i}`}
                                  value={tag.id}
                                >
                                  {tag.label}
                                </option>
                              );
                            },
                          )
                        ) : (
                          <option value="">No Tags</option>
                        )}
                      </>
                    ) : (
                      <option value="">Choose Server</option>
                    )}
                  </select>
                </div>
              </div>
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
                className={`filter--row--add ${i > 0 ? 'nm' : ''}`}
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
