import styles from "../../styles/views/adminSettings.module.scss";
import typo from "../../styles/components/typography.module.scss";
import buttons from "../../styles/components/button.module.scss";
import { useEffect, useState } from "react";
import { getFilters } from "../../services/config.service";

export default function SettingsFilter(props) {
  const [filters, setFilters] = useState({
    movie_filters: false,
    tv_filters: false,
  });

  useEffect(() => {
    getData();
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

      <div className={styles.filter__grid}>
        {Object.keys(filters).map((key) => {
          return (
            <div className={styles.filter__grid__section}>
              <p className={`${typo.smtitle} ${typo.bold}`}>
                {key === "movie_filters" ? "Movie" : "TV"} Filters
              </p>
              {filters[key] && filters[key].length > 0
                ? filters[key].map((item, i) => {
                    // const actions = item.actions;
                    const required = item.rows.filter(
                      (r) => r.comparison === "and"
                    );
                    const optional = item.rows.filter(
                      (r) => r.comparison !== "and"
                    );
                    return (
                      <div className={styles.filter__grid__item}>
                        <p className={`${typo.body} ${typo.medium}`}>
                          {item.title || `Movie Filter #${i + 1}`}
                        </p>
                        <div className={styles.filter__grid__item__section}>
                          <p className={`${typo.body} ${typo.medium}`}>
                            Criteria
                          </p>
                          {optional && optional.length > 0
                            ? optional.map((option) => {
                                return (
                                  <div
                                    className={
                                      styles.filter__grid__item__section__item
                                    }
                                  >
                                    <p>{option.condition}</p>
                                  </div>
                                );
                              })
                            : null}
                          <div
                            className={styles.filter__grid__item__section__add}
                          >
                            <button className={`${buttons.secondary}`}>
                              Add Condition +
                            </button>
                          </div>
                        </div>
                        <div className={styles.filter__grid__item__section}>
                          <p className={`${typo.body} ${typo.medium}`}>
                            Required
                          </p>
                          {required && required.length > 0
                            ? required.map((option) => {
                                return (
                                  <div
                                    className={
                                      styles.filter__grid__item__section__item
                                    }
                                  >
                                    <p>{option.condition}</p>
                                  </div>
                                );
                              })
                            : null}
                          <div
                            className={styles.filter__grid__item__section__add}
                          >
                            <button className={`${buttons.secondary}`}>
                              Add Condition +
                            </button>
                          </div>
                        </div>
                        <div className={styles.filter__grid__item__section}>
                          <p className={`${typo.body} ${typo.medium}`}>
                            Actions
                          </p>
                          <div
                            className={styles.filter__grid__item__section__add}
                          >
                            <button className={`${buttons.secondary}`}>
                              Add Action +
                            </button>
                          </div>
                        </div>
                        <button
                          className={`${styles.filter__grid__item__remove} ${buttons.primary__red}`}
                        >
                          Remove
                        </button>
                      </div>
                    );
                  })
                : null}
              <div className={styles.filter__grid__add}>
                <button className={`${buttons.primary}`}>Add Filter +</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
