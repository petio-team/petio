import languages from '../helpers/languages';
import inputs from '../styles/components/input.module.scss';
import typo from '../styles/components/typography.module.scss';
import styles from '../styles/views/adminSettings.module.scss';

const conditions = {
  genre: {
    type: 'string',
    value: 'genre',
    label: 'Genre',
  },
  year: {
    type: 'number',
    value: 'year',
    label: 'Year',
  },
  age_rating: {
    type: 'string',
    value: 'age_rating',
    label: 'Age Rating',
  },
  keyword: {
    type: 'string',
    value: 'keyword',
    label: 'Keyword',
  },
  language: {
    type: 'string',
    value: 'language',
    label: 'Language',
  },
  popularity: {
    type: 'number',
    value: 'popularity',
    label: 'Popularity',
  },
  network: {
    type: 'string',
    value: 'network',
    label: 'Network',
  },
  studio: {
    type: 'string',
    value: 'studio',
    label: 'Studio',
  },
  adult: {
    type: 'string',
    value: 'adult',
    label: 'Adult',
  },
  status: {
    type: 'string',
    value: 'status',
    label: 'Status',
  },
};
const operators = {
  equals: {
    type: 'any',
    value: 'equal',
    label: 'Is Equal To',
  },
  not: {
    type: 'any',
    value: 'not',
    label: 'Is Not Equal To',
  },
  greater: {
    type: 'number',
    value: 'greater',
    label: 'Greater Than',
  },
  less: {
    type: 'number',
    value: 'less',
    label: 'Less Than',
  },
};
const genres = {
  movie_filters: [
    { id: 28, name: 'Action' },
    { id: 12, name: 'Adventure' },
    { id: 16, name: 'Animation' },
    { id: 'anime', name: 'Anime' },
    { id: 35, name: 'Comedy' },
    { id: 80, name: 'Crime' },
    { id: 99, name: 'Documentary' },
    { id: 18, name: 'Drama' },
    { id: 10751, name: 'Family' },
    { id: 14, name: 'Fantasy' },
    { id: 36, name: 'History' },
    { id: 27, name: 'Horror' },
    { id: 10402, name: 'Music' },
    { id: 9648, name: 'Mystery' },
    { id: 10749, name: 'Romance' },
    { id: 878, name: 'Science Fiction' },
    { id: 10770, name: 'TV Movie' },
    { id: 53, name: 'Thriller' },
    { id: 10752, name: 'War' },
    { id: 37, name: 'Western' },
  ],
  tv_filters: [
    { id: 10759, name: 'Action & Adventure' },
    { id: 16, name: 'Animation' },
    { id: 'anime', name: 'Anime' },
    { id: 35, name: 'Comedy' },
    { id: 80, name: 'Crime' },
    { id: 99, name: 'Documentary' },
    { id: 18, name: 'Drama' },
    { id: 10751, name: 'Family' },
    { id: 10762, name: 'Kids' },
    { id: 9648, name: 'Mystery' },
    { id: 10763, name: 'News' },
    { id: 10764, name: 'Reality' },
    { id: 10765, name: 'Sci-Fi & Fantasy' },
    { id: 10766, name: 'Soap' },
    { id: 10767, name: 'Talk' },
    { id: 10768, name: 'War & Politics' },
    { id: 37, name: 'Western' },
  ],
};
const ageRatings = {
  movie_filters: [
    {
      certification: 'G',
    },
    {
      certification: 'PG-13',
    },
    {
      certification: 'R',
    },
    {
      certification: 'NC-17',
    },
    {
      certification: 'NR',
    },
    {
      certification: 'PG',
    },
  ],
  tv_filters: [
    {
      certification: 'NR',
    },
    {
      certification: 'TV-Y',
    },
    {
      certification: 'TV-Y7',
    },
    {
      certification: 'TV-G',
    },
    {
      certification: 'TV-PG',
    },
    {
      certification: 'TV-14',
    },
    {
      certification: 'TV-MA',
    },
  ],
};

export { genres, operators, conditions, ageRatings };

export default function FilterRow(props) {
  let conditionType = conditions[props.option.condition]
    ? conditions[props.option.condition].type
    : 'text';

  return (
    <div className={styles.filter__row}>
      {props.option.index > 0 ? (
        <p
          className={`${typo.small} ${typo.medium} ${typo.red} ${styles.filter__row__remove}`}
          onClick={() =>
            props.removeRow(
              props.type,
              props.option.rowIndex,
              props.option.index,
            )
          }
        >
          Remove
        </p>
      ) : null}
      <div className={styles.filter__row__content}>
        <div className={styles.filter__row__content__item}>
          <p className={`${typo.body}`}>Condition</p>
          <select
            className={inputs.select__light}
            value={props.option.condition}
            onChange={props.handleChange}
            data-rowindex={props.option.rowIndex}
            data-index={props.option.index}
            data-key="condition"
            data-type={props.type}
          >
            <option value="">Please Select</option>
            {Object.keys(conditions).map((i) => {
              let condition = conditions[i];
              return (
                <option
                  key={`${props.itemId}__condition__${i}`}
                  value={condition.value}
                >
                  {condition.label}
                </option>
              );
            })}
          </select>
        </div>
        <div className={styles.filter__row__content__item}>
          <p className={`${typo.body}`}>Operator</p>
          <select
            className={inputs.select__light}
            value={props.option.operator}
            onChange={props.handleChange}
            data-rowindex={props.option.rowIndex}
            data-index={props.option.index}
            data-key="operator"
            data-type={props.type}
          >
            {props.option.condition ? (
              <>
                <option value="">Please Select</option>
                {Object.keys(operators).map((i) => {
                  let operator = operators[i];
                  let type = conditionType;
                  if (operator.type === 'any' || operator.type === type) {
                    return (
                      <option
                        key={`${props.itemId}__operator__${i}`}
                        value={operator.value}
                      >
                        {operator.label}
                      </option>
                    );
                  }
                  return null;
                })}
              </>
            ) : (
              <option value="">Select condition</option>
            )}
          </select>
        </div>
        <div className={styles.filter__row__content__item}>
          <p className={`${typo.body}`}>Value</p>
          {props.option.condition === 'genre' ? (
            <select
              className={inputs.select__light}
              value={props.option.value}
              onChange={props.handleChange}
              data-rowindex={props.option.rowIndex}
              data-index={props.option.index}
              data-key="value"
              data-type={props.type}
            >
              <option value="">Select Genre</option>
              {genres[props.type].map((genre, i) => {
                return (
                  <option key={`${props.itemId}__value__${i}`} value={genre.id}>
                    {genre.name}
                  </option>
                );
              })}
            </select>
          ) : props.option.condition === 'age_rating' ? (
            <select
              className={inputs.select__light}
              value={props.option.value}
              onChange={props.handleChange}
              data-rowindex={props.option.rowIndex}
              data-index={props.option.index}
              data-key="value"
              data-type={props.type}
            >
              <option value="">Select Rating</option>
              {ageRatings[props.type].map((ar, i) => {
                return (
                  <option
                    key={`${props.itemId}__value__${i}`}
                    value={ar.certification}
                  >
                    {ar.certification}
                  </option>
                );
              })}
            </select>
          ) : props.option.condition === 'language' ? (
            <select
              className={inputs.select__light}
              value={props.option.value}
              onChange={props.handleChange}
              data-rowindex={props.option.rowIndex}
              data-index={props.option.index}
              data-key="value"
              data-type={props.type}
            >
              <option value="">Select Language</option>
              {languages.map((lang, i) => {
                return (
                  <option
                    key={`${props.itemId}__value__${i}`}
                    value={lang.code}
                  >
                    {lang.name}
                  </option>
                );
              })}
            </select>
          ) : (
            <input
              className={inputs.text__light}
              type={`${conditionType === 'number' ? 'number' : 'text'}`}
              value={!props.option.value ? '' : props.option.value}
              onChange={props.handleChange}
              data-rowindex={props.option.rowIndex}
              data-index={props.option.index}
              data-key="value"
              data-type={props.type}
            />
          )}
        </div>
      </div>
    </div>
  );
}
