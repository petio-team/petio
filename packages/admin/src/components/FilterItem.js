import React from "react";
import FilterAction from "./FilterAction";
import FilterRow from "./FilterRow";
import { ReactComponent as Add } from "../assets/svg/plus-circle.svg";

class FilterItem extends React.Component {
  render() {
    return (
      <div className="filter--list">
        {this.props.data.map((filter, i) => {
          return (
            <div className="filter--item" key={`mf__${i}`}>
              <p
                className="filter--item--title"
                style={this.props.data[i].collapsed ? { margin: 0 } : {}}
              >
                {`${this.props.label} Filter #${i + 1}`}{" "}
                <span
                  className="filter--item--collapse"
                  onClick={() => this.props.collapse(this.props.type, i)}
                >
                  {this.props.data[i].collapsed ? "Expand" : "Collapse"}
                </span>
                <span
                  className="filter--item--remove"
                  onClick={() => this.props.removeFilter(this.props.type, i)}
                >
                  Delete
                </span>
              </p>
              {!this.props.data[i].collapsed ? (
                <>
                  {this.props.data[i].rows.map((row, r) => {
                    return (
                      <FilterRow
                        key={`mf__${i}_r_${r}`}
                        row={r}
                        item={i}
                        data={row}
                        add={
                          r === this.props.data[i].rows.length - 1
                            ? true
                            : false
                        }
                        type={this.props.type}
                        total={this.props.data[i].rows.length}
                        addRow={() => this.props.addRow(this.props.type, i)}
                        removeRow={() =>
                          this.props.removeRow(this.props.type, i, r)
                        }
                        inputChange={this.props.inputChange}
                      />
                    );
                  })}
                  <FilterAction
                    servers={this.props.servers}
                    settings={this.props.settings}
                    item={i}
                    type={this.props.type}
                    inputChange={this.props.inputChange}
                    data={this.props.data[i].action}
                    addAction={this.props.addAction}
                    removeAction={this.props.removeAction}
                  />
                </>
              ) : null}
            </div>
          );
        })}
        <div
          className="filter--add"
          onClick={() => this.props.addFilter(this.props.type)}
        >
          <p>Add</p>
          <Add />
        </div>
      </div>
    );
  }
}

export default FilterItem;
