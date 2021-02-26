import React from "react";
import Api from "../../data/Api";
import FilterItem from "../../components/FilterItem";
// import Api from "../../data/Api";

class Filter extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      movie_filters: [],
      tv_filters: [],
      radarr_servers: "loading",
      radarr_settings: {},
      sonarr_servers: "loading",
      sonarr_settings: {},
    };

    this.addFilter = this.addFilter.bind(this);
    this.getArrs = this.getArrs.bind(this);
    this.getSettings = this.getSettings.bind(this);
    this.inputChange = this.inputChange.bind(this);
    this.addRow = this.addRow.bind(this);
    this.collapse = this.collapse.bind(this);
  }

  addFilter(type) {
    let filters = this.state[type];
    filters.push({
      rows: [
        {
          condition: false,
          operator: false,
          value: false,
          comparison: false,
        },
      ],
      action: {
        server: false,
        path: false,
        profile: false,
        tag: false,
        type: false,
      },
      collapse: false,
    });
    this.setState({
      [type]: filters,
    });
  }

  removeFilter(type, i) {
    let filters = this.state[type];
    filters = this.removeFromArray(filters, i);

    this.setState({
      [type]: filters,
    });
  }

  addRow(type, i) {
    console.log(type, i);
    let filters = this.state[type];
    filters[i].rows.push({
      condition: false,
      operator: false,
      value: false,
      comparison: "and",
    });
    this.setState({
      [type]: filters,
    });
  }

  removeRow(type, i, r) {
    let filters = this.state[type];
    filters[i].rows = this.removeFromArray(filters[i].rows, r);

    this.setState({
      [type]: filters,
    });
  }

  removeFromArray(array, i) {
    array.splice(i, 1);

    return array;
  }

  async getArrs() {
    try {
      let radarr = await Api.radarrConfig();
      let sonarr = await Api.sonarrConfig();
      this.setState({
        radarr_servers: radarr,
        sonarr_servers: sonarr,
      });
      radarr.map((item) => {
        this.getSettings(item.uuid, "radarr");
      });
      sonarr.map((item) => {
        this.getSettings(item.uuid, "sonarr");
      });
    } catch (err) {
      console.log(err);
      this.setState({
        radarr_servers: false,
        sonarr_servers: false,
      });
    }
  }

  async getSettings(uuid, type = "radarr" || "sonarr") {
    try {
      let settings =
        type === "radarr"
          ? await Api.radarrOptions(uuid)
          : await Api.sonarrOptions(uuid);
      let current =
        type === "radarr"
          ? this.state.radarr_settings
          : this.state.sonarr_settings;
      if (settings.profiles.error || settings.paths.error) {
        current[uuid] = "error";
      } else {
        current[uuid] = {
          profiles: settings.profiles.length > 0 ? settings.profiles : false,
          paths: settings.paths.length > 0 ? settings.paths : false,
        };
      }
      if (type === "radarr") {
        this.setState({
          radarr_settings: current,
        });
      } else {
        this.setState({
          sonarr_settings: current,
        });
      }
    } catch {
      return;
    }
  }

  inputChange(e) {
    const target = e.target;
    const name = target.name;
    let value = target.type === "checkbox" ? target.checked : target.value;

    if (target.dataset.type) {
      let current = this.state[target.dataset.type];
      console.log(typeof target.dataset.row);
      if (target.dataset.row === "action") {
        current[target.dataset.item][target.dataset.row][name] = value;
      } else {
        current[target.dataset.item].rows[target.dataset.row][name] = value;
      }
      this.setState({
        [target.dataset.type]: current,
      });
    } else {
      this.setState({
        [name]: value,
      });
    }
  }

  collapse(type, i) {
    let filters = this.state[type];
    filters[i].collapsed = filters[i].collapsed ? false : true;
    this.setState({
      [type]: filters,
    });
  }

  componentDidMount() {
    this.getArrs();
  }

  saveFilters() {
    alert("this would save all filters as they are set now");
  }

  render() {
    return (
      <div className="filter--wrap">
        <section>
          <p className="main-title mb--2">Filters</p>
          <p className="description">
            Filters can be used to send media to specific Sonarr / Radarr
            servers depending on their attributes. Multiple criteria can be
            specified using <code>AND</code> / <code>OR</code> connectors. Any
            one of the <code>OR</code> conditions can trigger a match, whereas
            an <code>AND</code> connector must <strong>always</strong> be true
            for the entire filter to match.
          </p>
        </section>
        <section>
          <p className="sub-title mb--2">Movie Filters</p>
          <FilterItem
            data={this.state.movie_filters}
            servers={this.state.radarr_servers}
            settings={this.state.radarr_settings}
            addRow={this.addRow}
            removeRow={this.removeRow}
            removeFilter={this.removeFilter}
            addFilter={this.addFilter}
            type={"movie_filters"}
            label="Movie"
            inputChange={this.inputChange}
            collapse={this.collapse}
          />
        </section>
        <section>
          <p className="sub-title mb--2">TV Show Filters</p>
          <FilterItem
            data={this.state.tv_filters}
            servers={this.state.sonarr_servers}
            settings={this.state.sonarr_settings}
            addRow={this.addRow}
            removeRow={this.removeRow}
            removeFilter={this.removeFilter}
            addFilter={this.addFilter}
            type={"tv_filters"}
            label="TV Show"
            inputChange={this.inputChange}
            collapse={this.collapse}
          />
        </section>
        <section>
          <button className="btn btn__square" onClick={this.saveFilters}>
            Save
          </button>
        </section>
      </div>
    );
  }
}

export default Filter;
