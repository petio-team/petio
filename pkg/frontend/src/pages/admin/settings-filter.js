import styles from "../../styles/views/adminSettings.module.scss";
import typo from "../../styles/components/typography.module.scss";
import buttons from "../../styles/components/button.module.scss";

import { useEffect, useState } from "react";
import {
  getFilters,
  getRadarr,
  getRadarrOptions,
  getSonarr,
  getSonarrOptions,
} from "../../services/config.service";
import FilterRow from "../../components/filterRow";
import FilterAction from "../../components/filterAction";
import {
  genres,
  // operators,
  conditions,
  // ageRatings,
} from "../../components/filterRow";
import languages from "../../helpers/languages";

export default function SettingsFilter(props) {
  const [filters, setFilters] = useState({
    movie_filters: false,
    tv_filters: false,
  });
  const [radarrServers, setRadarrServers] = useState("loading");
  const [sonarrServers, setSonarrServers] = useState("loading");
  const [radarrSettings, setRadarrSettings] = useState({});
  const [sonarrSettings, setSonarrSettings] = useState({});

  useEffect(() => {
    getData();
    getArrs();
    // eslint-disable-next-line
  }, []);

  async function getData() {
    try {
      const data = await getFilters();
      const dataFormatted = {};
      data.forEach((item) => {
        dataFormatted[item.id] = item.data;
      });
      setFilters({
        movie_filters: dataFormatted.movie_filters || [],
        tv_filters: dataFormatted.tv_filters || [],
      });
    } catch (e) {
      console.log(e);
      props.newNotification({
        message: "Couldn't load filters",
        type: "error",
      });
    }
  }

  function handleChangeRow(e) {
    const target = e.currentTarget;
    const row = target.dataset.rowindex;
    const item = target.dataset.index;
    const key = target.dataset.key;
    const value = target.value;
    const type = target.dataset.type;
    let existingFilters = { ...filters };
    if (
      existingFilters[type] &&
      existingFilters[type][row] &&
      existingFilters[type][row].rows &&
      existingFilters[type][row].rows[item]
    ) {
      existingFilters[type][row].rows[item][key] = value;
      if (key === "condition")
        existingFilters[type][row].rows[item].value = false;
      setFilters(existingFilters);
    } else {
      console.log(target);
      console.log("Failed to update filter");
    }
  }

  function handleChangeAction(e) {
    const target = e.currentTarget;
    const item = target.dataset.index;
    const key = target.dataset.key;
    const value = target.value;
    const type = target.dataset.type;
    const row = target.dataset.row;
    let existingFilters = { ...filters };
    if (
      existingFilters[type] &&
      existingFilters[type][item] &&
      existingFilters[type][item].action &&
      existingFilters[type][item].action[row]
    ) {
      existingFilters[type][item].action[row][key] = value;
      setFilters(existingFilters);
    } else {
      console.log(target);
      console.log("Failed to update filter");
    }
  }

  function addCondition(type, index, optional = true) {
    let existingFilters = { ...filters };
    existingFilters[type][index].rows.push({
      condition: false,
      operator: false,
      value: false,
      comparison: optional ? "or" : "and",
    });
    setFilters(existingFilters);
  }

  function addAction(type, index) {
    let existingFilters = { ...filters };
    existingFilters[type][index].action.push({
      server: false,
      path: false,
      profile: false,
      language: false,
      tag: false,
      type: false,
    });
    setFilters(existingFilters);
  }

  function removeRow(type, row, index) {
    let existingFilters = { ...filters };
    existingFilters[type][row].rows.splice(index, 1);
    setFilters(existingFilters);
  }

  function removeAction(type, index, row) {
    let existingFilters = { ...filters };
    existingFilters[type][index].action.splice(row, 1);
    setFilters(existingFilters);
  }

  function addFilter(type) {
    let existingFilters = { ...filters };
    existingFilters[type].push({
      action: [],
      rows: [
        {
          condition: false,
          operator: false,
          value: false,
          comparison: false,
        },
      ],
      collapse: false,
    });
    setFilters(existingFilters);
  }

  function removeFilter(type, index) {
    let existingFilters = { ...filters };
    existingFilters[type].splice(index, 1);
    setFilters(existingFilters);
  }

  function toggleCollapse(type, index) {
    let existingFilters = { ...filters };
    existingFilters[type][index].collapse =
      !existingFilters[type][index].collapse;
    setFilters(existingFilters);
  }

  async function getArrs() {
    try {
      let radarr = await getRadarr();
      let sonarr = await getSonarr();
      setRadarrServers(radarr);
      setSonarrServers(sonarr);
      let settingsRadarr = {};
      let settingsSonarr = {};
      radarr.forEach((item) => {
        getSettings(item.uuid, "radarr", settingsRadarr);
      });
      sonarr.forEach((item) => {
        getSettings(item.uuid, "sonarr", settingsSonarr);
      });
    } catch (err) {
      console.log(err);
      setRadarrServers("error");
      setSonarrServers("error");
    }
  }

  async function getSettings(uuid, type = "radarr" || "sonarr", current) {
    try {
      let settings =
        type === "radarr"
          ? await getRadarrOptions(uuid)
          : await getSonarrOptions(uuid);

      current[uuid] = {
        profiles:
          settings.profiles && settings.profiles.length > 0
            ? settings.profiles
            : false,
        paths:
          settings.paths && settings.paths.length > 0 ? settings.paths : false,
        languages:
          settings.languages && settings.languages.length > 0
            ? settings.languages
            : false,
        tags: settings.tags && settings.tags.length > 0 ? settings.tags : false,
      };

      if (type === "radarr") {
        setRadarrSettings(current);
      } else {
        setSonarrSettings({ ...sonarrSettings, ...current });
      }
      return;
    } catch (e) {
      console.log(e);
      return;
    }
  }

  function filterToText(type, index) {
    function formatOperator(operator) {
      if (!operator) return "not set";
      switch (operator) {
        case "equal":
          return "equal to";
        case "not":
          return "not equal to";
        case "greater":
          return "greater than";
        case "less":
          return "less than";
        default:
          return operator;
      }
    }

    function formatValue(item) {
      if (!item.value) return "not set";
      switch (item.condition) {
        case "genre":
          let genre = genres[type].filter(
            (g) => g.id.toString() === item.value.toString()
          );
          return genre[0].name;
        case "language":
          let lang = languages.filter((l) => l.code === item.value);
          return lang[0].name;
        default:
          return item.value;
      }
    }

    function formatProfile(id, uuid) {
      if (!id) return "not set";
      let profiles = false;
      if (type === "movie_filters") {
        profiles = radarrSettings[uuid].profiles;
      } else {
        profiles = sonarrSettings[uuid].profiles;
      }
      let profile = profiles.filter((p) => p.id.toString() === id.toString());
      return profile[0].name;
    }

    function formatServer(uuid) {
      let servers = false;
      if (type === "movie_filters") {
        servers = radarrServers;
      } else {
        servers = sonarrServers;
      }
      let server = servers.filter((s) => s.uuid === uuid);
      return server[0].title;
    }

    const filter = filters[type][index];
    if (!filter) return null;
    let required = [];
    let optional = [];
    filter.rows.forEach((item, index) => {
      if (item.comparison === "and") {
        required.push(item);
      } else {
        optional.push(item);
      }
    });
    let output = "";
    optional.forEach((item, i) => {
      if (conditions[item.condition]) {
        if (i === 0) output += "<b>If</b> ";
        if (i > 0) output += " <b>or if</b> ";
        output += `${conditions[item.condition].label} is ${formatOperator(
          item.operator
        )} ${formatValue(item)}`;
      }
    });
    required.forEach((item, i) => {
      if (conditions[item.condition]) {
        output += " <b>and</b> ";
        output += `${
          conditions[item.condition].label
        } is always ${formatOperator(item.operator)} ${formatValue(item)}`;
      }
    });
    if (filter.action.length === 0) {
      output += " <b>then</b> do nothing";
    } else {
      filter.action.forEach((action, i) => {
        if (!action.server) {
          output += " <b>then</b> do nothing";
        } else {
          if (i === 0) output += " <b>then</b> send to ";
          if (i > 0) output += " <b>and</b> also send to ";
          output += `${formatServer(
            action.server
          )} with the quality profile ${formatProfile(
            action.profile,
            action.server
          )} and use the root path <code>${action.path}</code>`;
        }
      });
    }
    output += ".";
    return output;
  }

  function validateFilters() {
    for (let key in filters) {
      const type = filters[key];
      for (let i in type) {
        const filter = type[i];
        for (let a in filter.action) {
          const action = filter.action[a];
          if (!action.path || !action.profile || !action.server || !action.type)
            return false;
        }
        for (let r in filter.rows) {
          const row = filter.rows[r];
          if (!row.condition || !row.operator || row.value === false)
            return false;
        }
      }
    }
    return true;
  }

  async function saveFilters() {
    const n = props.newNotification({
      message: "Validating filters",
      type: "loading",
    });
    const validation = await validateFilters();
    console.log(validation);
    if (!validation) {
      props.newNotification({
        message: "Failed to validate filters",
        type: "error",
        id: n,
      });
    } else {
      props.newNotification({
        message: "Filters validated",
        type: "success",
        id: n,
      });
    }
    console.log("save");
  }

  console.log(filters);

  return (
    <div className={styles.filter__wrap}>
      <p className={`${typo.smtitle} ${typo.bold}`}>Filters</p>
      <br />
      <p className={`${typo.small}`}>
        Don't want to send all your requests to the default Radarr / Sonarr
        instance? <br />
        Want to use custom rules based on the type of request your users make,
        using different profiles and root paths? <br />
        Then Filters are for you!
      </p>
      <br />
      <p className={`${typo.small}`}>
        Below you can create custom filters, which if matched will circumvent
        the default behaviour of Petio. Each filter contains conditions, grouped
        by "required" and "criteria". "Required" conditions must always be true
        and the filter will not trigger if any of these conditions are not
        matched. "Criteria" conditions only require one of the conditions to
        match in order to match. <br />
        Note: Filters are read from top to bottom and will only match once.
      </p>
      <br />
      <button
        className={`${buttons.primary} ${buttons.small}`}
        onClick={saveFilters}
      >
        Save filters
      </button>
      <br />
      <div className={styles.filter__grid}>
        {Object.keys(filters).map((key) => {
          return (
            <div
              className={styles.filter__grid__section}
              key={`filter__${key}`}
            >
              <p className={`${typo.smtitle} ${typo.bold}`}>
                {key === "movie_filters" ? "Movie" : "TV"} Filters
              </p>
              {filters[key] && filters[key].length > 0
                ? filters[key].map((item, i) => {
                    if (item.collapse)
                      return (
                        <div
                          className={styles.filter__grid__item}
                          key={`filter__${key}__${i + 1}`}
                        >
                          <p className={`${typo.body} ${typo.medium}`}>
                            {item.title || `Movie Filter #${i + 1}`}
                          </p>
                          <p
                            className={`${typo.small} ${typo.uppercase} ${typo.medium} ${styles.filter__grid__item__collapse}`}
                            onClick={() => toggleCollapse(key, i)}
                          >
                            Expand
                          </p>
                          <div className={styles.filter__grid__item__section}>
                            <p
                              className={`${typo.body} ${styles.filter__grid__item__section__overview}`}
                              dangerouslySetInnerHTML={{
                                __html: filterToText(key, i),
                              }}
                            ></p>
                          </div>
                        </div>
                      );
                    const actions = item.action;
                    let required = [];
                    let optional = [];
                    item.rows.forEach((item, index) => {
                      if (item.comparison === "and") {
                        required.push({ ...item, index: index, rowIndex: i });
                      } else {
                        optional.push({ ...item, index: index, rowIndex: i });
                      }
                    });
                    return (
                      <div
                        className={styles.filter__grid__item}
                        key={`filter__${key}__${i + 1}`}
                      >
                        <p className={`${typo.body} ${typo.medium}`}>
                          {item.title || `Movie Filter #${i + 1}`}
                        </p>
                        <p
                          className={`${typo.small} ${typo.uppercase} ${typo.medium} ${styles.filter__grid__item__collapse}`}
                          onClick={() => toggleCollapse(key, i)}
                        >
                          Collapse
                        </p>
                        <div className={styles.filter__grid__item__section}>
                          <p className={`${typo.body} ${typo.medium}`}>
                            Criteria
                          </p>
                          {optional && optional.length > 0
                            ? optional.map((option, o) => {
                                return (
                                  <FilterRow
                                    option={option}
                                    type={key}
                                    itemId={`filter__${key}__${
                                      i + 1
                                    }__optional__row__${o}`}
                                    handleChange={handleChangeRow}
                                    removeRow={removeRow}
                                    key={`filter__${key}__${
                                      i + 1
                                    }__optional__row__${o}`}
                                  />
                                );
                              })
                            : null}
                          <div
                            className={styles.filter__grid__item__section__add}
                          >
                            <button
                              className={`${buttons.secondary}`}
                              onClick={() => addCondition(key, i, true)}
                            >
                              Add Condition +
                            </button>
                          </div>
                        </div>
                        <div className={styles.filter__grid__item__section}>
                          <p className={`${typo.body} ${typo.medium}`}>
                            Required
                          </p>
                          {required && required.length > 0
                            ? required.map((option, o) => {
                                return (
                                  <FilterRow
                                    option={option}
                                    type={key}
                                    itemId={`filter__${key}__${
                                      i + 1
                                    }__required__row__${o}`}
                                    handleChange={handleChangeRow}
                                    removeRow={removeRow}
                                    key={`filter__${key}__${
                                      i + 1
                                    }__required__row__${o}`}
                                  />
                                );
                              })
                            : null}
                          <div
                            className={styles.filter__grid__item__section__add}
                          >
                            <button
                              className={`${buttons.secondary}`}
                              onClick={() => addCondition(key, i, false)}
                            >
                              Add Condition +
                            </button>
                          </div>
                        </div>
                        <div
                          className={styles.filter__grid__item__section__action}
                        >
                          <p className={`${typo.body} ${typo.medium}`}>
                            Actions
                          </p>
                          {actions && actions.length > 0
                            ? actions.map((action, a) => {
                                return (
                                  <FilterAction
                                    action={action}
                                    index={i}
                                    row={a}
                                    type={key}
                                    itemId={`filter__${key}__${
                                      i + 1
                                    }__action__row__${a}`}
                                    handleChange={handleChangeAction}
                                    removeAction={removeAction}
                                    key={`filter__${key}__${
                                      i + 1
                                    }__action__row__${a}`}
                                    servers={
                                      key === "movie_filters"
                                        ? radarrServers
                                        : sonarrServers
                                    }
                                    settings={
                                      key === "movie_filters"
                                        ? radarrSettings
                                        : sonarrSettings
                                    }
                                  />
                                );
                              })
                            : null}
                          <div
                            className={styles.filter__grid__item__section__add}
                          >
                            <button
                              className={`${buttons.secondary}`}
                              onClick={() => addAction(key, i)}
                            >
                              Add Action +
                            </button>
                          </div>
                        </div>
                        <button
                          className={`${styles.filter__grid__item__remove} ${buttons.primary__red}`}
                          onClick={() => removeFilter(key, i)}
                        >
                          Remove
                        </button>
                      </div>
                    );
                  })
                : null}
              <div className={styles.filter__grid__add}>
                <button
                  className={`${buttons.primary}`}
                  onClick={() => addFilter(key)}
                >
                  Add Filter +
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <br />
      <button
        className={`${buttons.primary} ${buttons.small}`}
        onClick={saveFilters}
      >
        Save filters
      </button>
    </div>
  );
}
