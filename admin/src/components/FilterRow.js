import React from "react";
import { ReactComponent as Add } from "../assets/svg/plus-circle.svg";
import { ReactComponent as Minus } from "../assets/svg/minus-circle.svg";

class FilterRow extends React.Component {
  render() {
    const fs = this.props.type === "movie_filters" ? "mf" : "tf";
    const conditions = {
      genre: {
        type: "string",
        value: "genre",
        label: "Genre",
      },
      year: {
        type: "number",
        value: "year",
        label: "Year",
      },
      age_rating: {
        type: "string",
        value: "age_rating",
        label: "Age Rating",
      },
      keyword: {
        type: "string",
        value: "keyword",
        label: "Keyword",
      },
    };
    const operators = {
      equals: {
        type: "any",
        value: "equal",
        label: "Is Equal To",
      },
      not: {
        type: "any",
        value: "not",
        label: "Is Not Equal To",
      },
      greater: {
        type: "number",
        value: "greater",
        label: "Greater Than",
      },
      less: {
        type: "number",
        value: "less",
        label: "Less Than",
      },
    };
    const genres =
      this.props.type === "movie_filters"
        ? [
            { id: 28, name: "Action" },
            { id: 12, name: "Adventure" },
            { id: 16, name: "Animation" },
            { id: "anime", name: "Anime" },
            { id: 35, name: "Comedy" },
            { id: 80, name: "Crime" },
            { id: 99, name: "Documentary" },
            { id: 18, name: "Drama" },
            { id: 10751, name: "Family" },
            { id: 14, name: "Fantasy" },
            { id: 36, name: "History" },
            { id: 27, name: "Horror" },
            { id: 10402, name: "Music" },
            { id: 9648, name: "Mystery" },
            { id: 10749, name: "Romance" },
            { id: 878, name: "Science Fiction" },
            { id: 10770, name: "TV Movie" },
            { id: 53, name: "Thriller" },
            { id: 10752, name: "War" },
            { id: 37, name: "Western" },
          ]
        : [
            { id: 10759, name: "Action & Adventure" },
            { id: 16, name: "Animation" },
            { id: "anime", name: "Anime" },
            { id: 35, name: "Comedy" },
            { id: 80, name: "Crime" },
            { id: 99, name: "Documentary" },
            { id: 18, name: "Drama" },
            { id: 10751, name: "Family" },
            { id: 10762, name: "Kids" },
            { id: 9648, name: "Mystery" },
            { id: 10763, name: "News" },
            { id: 10764, name: "Reality" },
            { id: 10765, name: "Sci-Fi & Fantasy" },
            { id: 10766, name: "Soap" },
            { id: 10767, name: "Talk" },
            { id: 10768, name: "War & Politics" },
            { id: 37, name: "Western" },
          ];
    let conditionType = conditions[this.props.data.condition]
      ? conditions[this.props.data.condition].type
      : "text";
    return (
      <>
        {this.props.row > 0 ? (
          <select
            className="filter--comparison"
            data-type={this.props.type}
            data-row={this.props.row}
            data-item={this.props.item}
            name="comparison"
            onChange={this.props.inputChange}
            value={this.props.data.comparison}
          >
            <option value="and">AND</option>
            <option value="or">OR</option>
          </select>
        ) : null}
        <div className="filter--row">
          <div className="filter--row--item">
            <p className="filter--row--item--title">Condition</p>
            <div className="select-wrap">
              <select
                data-type={this.props.type}
                data-row={this.props.row}
                data-item={this.props.item}
                name="condition"
                onChange={this.props.inputChange}
                value={this.props.data.condition}
              >
                <option value="">Please Select</option>
                {Object.keys(conditions).map((i) => {
                  let condition = conditions[i];
                  return (
                    <option
                      key={`${fs}__${this.props.item}__c_${i}`}
                      value={condition.value}
                    >
                      {condition.label}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
          <div className="filter--row--item">
            <p className="filter--row--item--title">Operator</p>
            <div className="select-wrap">
              <select
                data-type={this.props.type}
                data-row={this.props.row}
                data-item={this.props.item}
                name="operator"
                onChange={this.props.inputChange}
                value={this.props.data.operator}
              >
                {this.props.data.condition ? (
                  <>
                    <option value="">Please Select</option>
                    {Object.keys(operators).map((i) => {
                      let operator = operators[i];
                      let type = conditionType;
                      console.log(operator.type === "any", type);
                      if (operator.type === "any" || operator.type === type) {
                        return (
                          <option
                            key={`${fs}__${this.props.item}__o_${i}`}
                            value={operator.value}
                          >
                            {operator.label}
                          </option>
                        );
                      }
                    })}{" "}
                  </>
                ) : (
                  <option value="">Select condition</option>
                )}
              </select>
            </div>
          </div>
          <div className="filter--row--item">
            <p className="filter--row--item--title">Value</p>
            {this.props.data.condition === "genre" ? (
              <div className="select-wrap">
                <select
                  data-type={this.props.type}
                  data-row={this.props.row}
                  data-item={this.props.item}
                  name="genre"
                  onChange={this.props.inputChange}
                  value={this.props.data.genre}
                >
                  <option value="">Select genre</option>
                  {genres.map((genre) => {
                    return (
                      <option
                        key={`${fs}__${this.props.item}__g_${genre.id}`}
                        value={genre.id}
                      >
                        {genre.name}
                      </option>
                    );
                  })}
                </select>
              </div>
            ) : (
              <input
                type={`${conditionType === "number" ? "number" : "text"}`}
                readOnly={!this.props.data.condition}
                data-type={this.props.type}
                data-row={this.props.row}
                data-item={this.props.item}
                name="value"
                onChange={this.props.inputChange}
                value={!this.props.data.value ? "" : this.props.data.value}
              />
            )}
          </div>
          {this.props.total > 1 ? (
            <div className="filter--row--remove" onClick={this.props.removeRow}>
              <Minus />
            </div>
          ) : null}
          {this.props.add ? (
            <div
              className={`filter--row--add ${this.props.total > 1 ? "nm" : ""}`}
              onClick={this.props.addRow}
            >
              <Add />
            </div>
          ) : null}
        </div>
      </>
    );
  }
}

export default FilterRow;
