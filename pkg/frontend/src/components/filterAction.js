import inputs from "../styles/components/input.module.scss";
import styles from "../styles/views/adminSettings.module.scss";
import typo from "../styles/components/typography.module.scss";

export default function FilterAction(props) {
  return (
    <div className={styles.filter__row}>
      {props.row > 0 ? (
        <p
          className={`${typo.small} ${typo.medium} ${typo.red} ${styles.filter__row__remove}`}
          onClick={() => props.removeAction(props.type, props.index, props.row)}
        >
          Remove
        </p>
      ) : null}
      <div className={styles.filter__row__content}>
        <div className={styles.filter__row__content__item}>
          <p className={`${typo.body}`}>Server</p>
          <select
            className={inputs.select__light}
            value={props.action.server}
            onChange={props.handleChange}
            data-row={props.row}
            data-index={props.index}
            data-key="server"
            data-type={props.type}
          >
            {props.servers === "loading" ? (
              <option value="">Loading</option>
            ) : props.servers && props.servers.length > 0 ? (
              <>
                <option value="">Please Select</option>
                {props.servers.map((server, i) => {
                  return (
                    <option
                      key={`${props.itemId}__server__${i}`}
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
        <div className={styles.filter__row__content__item}>
          <p className={`${typo.body}`}>Path</p>
          <select
            className={inputs.select__light}
            value={props.action.path}
            onChange={props.handleChange}
            data-row={props.row}
            data-index={props.index}
            data-key="path"
            data-type={props.type}
          >
            {!props.action.server ? (
              <option value="">Select Server</option>
            ) : props.settings &&
              props.settings[props.action.server] &&
              props.settings[props.action.server].paths.length > 0 ? (
              <>
                <option value="">Please Select</option>
                {props.settings[props.action.server].paths.map((path, i) => {
                  return (
                    <option
                      key={`${props.itemId}__path__${i}`}
                      value={path.path}
                    >
                      {path.path}
                    </option>
                  );
                })}
              </>
            ) : (
              <option value="">No paths available</option>
            )}
          </select>
        </div>
        <div className={styles.filter__row__content__item}>
          <p className={`${typo.body}`}>Profile</p>
          <select
            className={inputs.select__light}
            value={props.action.profile}
            onChange={props.handleChange}
            data-row={props.row}
            data-index={props.index}
            data-key="profile"
            data-type={props.type}
          >
            {!props.action.server ? (
              <option value="">Select Server</option>
            ) : props.settings &&
              props.settings[props.action.server] &&
              props.settings[props.action.server].profiles.length > 0 ? (
              <>
                <option value="">Please Select</option>
                {props.settings[props.action.server].profiles.map(
                  (profile, i) => {
                    return (
                      <option
                        key={`${props.itemId}__profile__${i}`}
                        value={profile.id}
                      >
                        {profile.name}
                      </option>
                    );
                  }
                )}
              </>
            ) : (
              <option value="">No tags available</option>
            )}
          </select>
        </div>
        <div className={styles.filter__row__content__item}>
          <p className={`${typo.body}`}>Language</p>
          <select
            className={inputs.select__light}
            value={props.action.language}
            onChange={props.handleChange}
            data-row={props.row}
            data-index={props.index}
            data-key="language"
            data-type={props.type}
          >
            {!props.action.server ? (
              <option value="">Select Server</option>
            ) : props.settings &&
              props.settings[props.action.server] &&
              props.settings[props.action.server].languages.length > 0 ? (
              <>
                <option value="">Please Select</option>
                {props.settings[props.action.server].languages.map(
                  (lang, i) => {
                    return (
                      <option
                        key={`${props.itemId}__language__${i}`}
                        value={lang.language.id}
                      >
                        {lang.language.name}
                      </option>
                    );
                  }
                )}
              </>
            ) : (
              <option value="">No langauges available</option>
            )}
          </select>
        </div>
        <div className={styles.filter__row__content__item}>
          <p className={`${typo.body}`}>Tag</p>
          <select
            className={inputs.select__light}
            value={props.action.tag}
            onChange={props.handleChange}
            data-row={props.row}
            data-index={props.index}
            data-key="tag"
            data-type={props.type}
          >
            {!props.action.server ? (
              <option value="">Select Server</option>
            ) : props.settings &&
              props.settings[props.action.server] &&
              props.settings[props.action.server].tags.length > 0 ? (
              <>
                <option value="">Please Select</option>
                {props.settings[props.action.server].tags.map((tag, i) => {
                  return (
                    <option key={`${props.itemId}__tag__${i}`} value={tag.id}>
                      {tag.label}
                    </option>
                  );
                })}
              </>
            ) : (
              <option value="">No tags available</option>
            )}
          </select>
        </div>
        <div className={styles.filter__row__content__item}>
          <p className={`${typo.body}`}>Type</p>
          <select
            className={inputs.select__light}
            value={props.action.type}
            onChange={props.handleChange}
            data-row={props.row}
            data-index={props.index}
            data-key="type"
            data-type={props.type}
          >
            {props.action.server &&
            props.settings &&
            props.settings[props.action.server] ? (
              <>
                <option value="">Please Select</option>
                <option value="standard">Standard</option>
                <option value="daily">Daily</option>
                <option value="anime">Anime</option>
              </>
            ) : (
              <option value="">Select Server</option>
            )}
          </select>
        </div>
      </div>
    </div>
  );
}
