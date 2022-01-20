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
    this.addAction = this.addAction.bind(this);
    this.collapse = this.collapse.bind(this);
    this.saveFilters = this.saveFilters.bind(this);
    this.getFilters = this.getFilters.bind(this);
    this.removeRow = this.removeRow.bind(this);
    this.removeFilter = this.removeFilter.bind(this);
    this.getFilters = this.getFilters.bind(this);
    this.removeAction = this.removeAction.bind(this);
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
      action: [
        {
          server: false,
          path: false,
          profile: false,
          tag: false,
          type: false,
        },
      ],
      collapse: false,
    });
    this.setState({
      [type]: filters,
    });
    this.props.msg({
      message: "New Filter Added",
    });
  }

  removeFilter(type, i) {
    let filters = this.state[type];
    filters = this.removeFromArray(filters, i);

    this.setState({
      [type]: filters,
    });

    this.props.msg({
      message: "Filter Removed",
    });
  }

  addRow(type, i) {
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
    this.props.msg({
      message: "Condition Added",
    });
  }

  addAction(type, i) {
    let filters = this.state[type];
    if (!Array.isArray(filters[i].action))
      filters[i].action = [filters[i].action];
    filters[i].action.push({
      path: false,
      profile: false,
      server: false,
      tag: false,
      type: false,
    });
    this.setState({
      [type]: filters,
    });
    this.props.msg({
      message: "Action Added",
    });
  }

  removeRow(type, i, r) {
    let filters = this.state[type];
    filters[i].rows = this.removeFromArray(filters[i].rows, r);

    this.setState({
      [type]: filters,
    });

    this.props.msg({
      message: "Condition Removed",
    });
  }

  removeAction(type, i, r) {
    let filters = this.state[type];
    filters[i].action = this.removeFromArray(filters[i].action, r);

    this.setState({
      [type]: filters,
    });

    this.props.msg({
      message: "Action Removed",
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
          tags: settings.tags.length > 0 ? settings.tags : false,
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
      console.log(current, target.dataset.type);
      if (target.dataset.row === "action") {
        let actionRow = target.dataset.actionRow;
        console.log(target.dataset);
        if (!Array.isArray(current[target.dataset.item].action)) {
          current[target.dataset.item].action = [
            current[target.dataset.item].action,
          ];
        }
        current[target.dataset.item][target.dataset.row][actionRow][
          name
        ] = value;
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

  async getFilters() {
    try {
      let data = await Api.getFilters();
      let filters = {};
      data.map((item) => {
        filters[item.id] = item.data;
      });

      this.setState({
        movie_filters: filters.movie_filters ? filters.movie_filters : [],
        tv_filters: filters.tv_filters ? filters.tv_filters : [],
      });
      this.props.msg({
        message: "Filters Loaded",
      });
      // this.setState({})
    } catch (err) {
      console.log(err);
      this.props.msg({
        message: "Unable to Load Filters",
        type: "error",
      });
    }
  }

  componentDidMount() {
    this.getArrs();
    this.getFilters();
  }

  async saveFilters() {
    try {
      await Api.updateFilters(this.state.movie_filters, this.state.tv_filters);

      this.props.msg({
        message: "Filters Saved",
        type: "good",
      });
    } catch (err) {
      this.props.msg({
        message: "Failed to Save Filters",
        type: "error",
      });
    }
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
            addAction={this.addAction}
            removeRow={this.removeRow}
            removeAction={this.removeAction}
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
            addAction={this.addAction}
            removeRow={this.removeRow}
            removeAction={this.removeAction}
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
