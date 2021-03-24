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
      language: {
        type: "string",
        value: "language",
        label: "Language"
      }
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
    const ageRatings =
      this.props.type === "movie_filters"
        ? [
            {
              certification: "G",
            },
            {
              certification: "PG-13",
            },
            {
              certification: "R",
            },
            {
              certification: "NC-17",
            },
            {
              certification: "NR",
            },
            {
              certification: "PG",
            },
          ]
        : [
            {
              certification: "NR",
            },
            {
              certification: "TV-Y",
            },
            {
              certification: "TV-Y7",
            },
            {
              certification: "TV-G",
            },
            {
              certification: "TV-PG",
            },
            {
              certification: "TV-14",
            },
            {
              certification: "TV-MA",
            },
          ];
    const languages = [
      { isoCode: "aa", name: "Afar" },
      { isoCode: "af", name: "Afrikaans" },
      { isoCode: "ak", name: "Akan" },
      { isoCode: "an", name: "Aragonese" },
      { isoCode: "as", name: "Assamese" },
      { isoCode: "av", name: "Avaric" },
      { isoCode: "ae", name: "Avestan" },
      { isoCode: "ay", name: "Aymara" },
      { isoCode: "az", name: "Azerbaijani" },
      { isoCode: "ba", name: "Bashkir" },
      { isoCode: "bm", name: "Bambara" },
      { isoCode: "bi", name: "Bislama" },
      { isoCode: "bo", name: "Tibetan" },
      { isoCode: "br", name: "Breton" },
      { isoCode: "ca", name: "Catalan" },
      { isoCode: "cs", name: "Czech" },
      { isoCode: "ce", name: "Chechen" },
      { isoCode: "cu", name: "Slavic" },
      { isoCode: "cv", name: "Chuvash" },
      { isoCode: "kw", name: "Cornish" },
      { isoCode: "co", name: "Corsican" },
      { isoCode: "cr", name: "Cree" },
      { isoCode: "cy", name: "Welsh" },
      { isoCode: "da", name: "Danish" },
      { isoCode: "de", name: "German" },
      { isoCode: "dv", name: "Divehi" },
      { isoCode: "dz", name: "Dzongkha" },
      { isoCode: "ee", name: "Ewe" },
      { isoCode: "en", name: "English" },
      { isoCode: "eo", name: "Esperanto" },
      { isoCode: "et", name: "Estonian" },
      { isoCode: "eu", name: "Basque" },
      { isoCode: "fo", name: "Faroese" },
      { isoCode: "fj", name: "Fijian" },
      { isoCode: "fi", name: "Finnish" },
      { isoCode: "fr", name: "French" },
      { isoCode: "fy", name: "Frisian" },
      { isoCode: "ff", name: "Fulah" },
      { isoCode: "gd", name: "Gaelic" },
      { isoCode: "ga", name: "Irish" },
      { isoCode: "gl", name: "Gallegan" },
      { isoCode: "gv", name: "Manx" },
      { isoCode: "gu", name: "Gujarati" },
      { isoCode: "ht", name: "Haitian" },
      { isoCode: "ha", name: "Hausa" },
      { isoCode: "sh", name: "Serbo-Croatian" },
      { isoCode: "hz", name: "Herero" },
      { isoCode: "ho", name: "Hiri Motu" },
      { isoCode: "hr", name: "Croatian" },
      { isoCode: "hu", name: "Hungarian" },
      { isoCode: "ig", name: "Igbo" },
      { isoCode: "io", name: "Ido" },
      { isoCode: "ii", name: "Yi" },
      { isoCode: "iu", name: "Inuktitut" },
      { isoCode: "ie", name: "Interlingue" },
      { isoCode: "ia", name: "Interlingua" },
      { isoCode: "id", name: "Indonesian" },
      { isoCode: "ik", name: "Inupiaq" },
      { isoCode: "is", name: "Icelandic" },
      { isoCode: "it", name: "Italian" },
      { isoCode: "jv", name: "Javanese" },
      { isoCode: "ja", name: "Japanese" },
      { isoCode: "kl", name: "Kalaallisut" },
      { isoCode: "kn", name: "Kannada" },
      { isoCode: "ks", name: "Kashmiri" },
      { isoCode: "kr", name: "Kanuri" },
      { isoCode: "kk", name: "Kazakh" },
      { isoCode: "km", name: "Khmer" },
      { isoCode: "ki", name: "Kikuyu" },
      { isoCode: "rw", name: "Kinyarwanda" },
      { isoCode: "ky", name: "Kirghiz" },
      { isoCode: "kv", name: "Komi" },
      { isoCode: "kg", name: "Kongo" },
      { isoCode: "ko", name: "Korean" },
      { isoCode: "kj", name: "Kuanyama" },
      { isoCode: "lo", name: "Lao" },
      { isoCode: "la", name: "Latin" },
      { isoCode: "lv", name: "Latvian" },
      { isoCode: "li", name: "Limburgish" },
      { isoCode: "ln", name: "Lingala" },
      { isoCode: "lt", name: "Lithuanian" },
      { isoCode: "lb", name: "Letzeburgesch" },
      { isoCode: "lu", name: "Luba-Katanga" },
      { isoCode: "lg", name: "Gandaa" },
      { isoCode: "mh", name: "Marshall" },
      { isoCode: "ml", name: "Malayalam" },
      { isoCode: "mr", name: "Marathi" },
      { isoCode: "mg", name: "Malagasy" },
      { isoCode: "mt", name: "Maltese" },
      { isoCode: "mo", name: "Moldavian" },
      { isoCode: "mn", name: "Mongolian" },
      { isoCode: "mi", name: "Maori" },
      { isoCode: "ms", name: "Malay" },
      { isoCode: "my", name: "Burmese" },
      { isoCode: "na", name: "Nauru" },
      { isoCode: "nv", name: "Navajo" },
      { isoCode: "nr", name: "Ndebele (nr)" },
      { isoCode: "nd", name: "Ndebele (nd)" },
      { isoCode: "ne", name: "Nepali" },
      { isoCode: "nl", name: "Dutch" },
      { isoCode: "nn", name: "Norwegian Nynorsk" },
      { isoCode: "nb", name: "Norwegian Bokmål" },
      { isoCode: "no", name: "Norwegian" },
      { isoCode: "ny", name: "Chichewa; Nyanja" },
      { isoCode: "oc", name: "Occitan" },
      { isoCode: "oj", name: "Ojibwa" },
      { isoCode: "or", name: "Oriya" },
      { isoCode: "om", name: "Oromo" },
      { isoCode: "os", name: "Ossetian; Ossetic" },
      { isoCode: "pi", name: "Pali" },
      { isoCode: "pt", name: "Portuguese" },
      { isoCode: "qu", name: "Quechua" },
      { isoCode: "rm", name: "Raeto-Romance" },
      { isoCode: "ro", name: "Romanian" },
      { isoCode: "rn", name: "Rundi" },
      { isoCode: "ru", name: "Russian" },
      { isoCode: "sg", name: "Sango" },
      { isoCode: "sa", name: "Sanskrit" },
      { isoCode: "si", name: "Sinhalese" },
      { isoCode: "sk", name: "Slovak" },
      { isoCode: "sl", name: "Slovenian" },
      { isoCode: "se", name: "Northern Sami" },
      { isoCode: "sm", name: "Samoan" },
      { isoCode: "sn", name: "Shona" },
      { isoCode: "sd", name: "Sindhi" },
      { isoCode: "so", name: "Somali" },
      { isoCode: "st", name: "Sotho" },
      { isoCode: "es", name: "Spanish" },
      { isoCode: "sq", name: "Albanian" },
      { isoCode: "sc", name: "Sardinian" },
      { isoCode: "sr", name: "Serbian" },
      { isoCode: "ss", name: "Swati" },
      { isoCode: "su", name: "Sundanese" },
      { isoCode: "sw", name: "Swahili" },
      { isoCode: "sv", name: "Swedish" },
      { isoCode: "ty", name: "Tahitian" },
      { isoCode: "ta", name: "Tamil" },
      { isoCode: "tt", name: "Tatar" },
      { isoCode: "te", name: "Telugu" },
      { isoCode: "tg", name: "Tajik" },
      { isoCode: "tl", name: "Tagalog" },
      { isoCode: "th", name: "Thai" },
      { isoCode: "ti", name: "Tigrinya" },
      { isoCode: "to", name: "Tonga" },
      { isoCode: "tn", name: "Tswana" },
      { isoCode: "ts", name: "Tsonga" },
      { isoCode: "tk", name: "Turkmen" },
      { isoCode: "tr", name: "Turkish" },
      { isoCode: "tw", name: "Twi" },
      { isoCode: "ug", name: "Uighur" },
      { isoCode: "uk", name: "Ukrainian" },
      { isoCode: "ur", name: "Urdu" },
      { isoCode: "ve", name: "Venda" },
      { isoCode: "vi", name: "Vietnamese" },
      { isoCode: "vo", name: "Volapük" },
      { isoCode: "wa", name: "Walloon" },
      { isoCode: "wo", name: "Wolof" },
      { isoCode: "xh", name: "Xhosa" },
      { isoCode: "yi", name: "Yiddish" },
      { isoCode: "za", name: "Zhuang" },
      { isoCode: "zu", name: "Zulu" },
      { isoCode: "ab", name: "Abkhazian" },
      { isoCode: "zh", name: "Mandarin" },
      { isoCode: "ps", name: "Pushto" },
      { isoCode: "am", name: "Amharic" },
      { isoCode: "ar", name: "Arabic" },
      { isoCode: "bg", name: "Bulgarian" },
      { isoCode: "cn", name: "Cantonese" },
      { isoCode: "mk", name: "Macedonian" },
      { isoCode: "el", name: "Greek" },
      { isoCode: "fa", name: "Persian" },
      { isoCode: "he", name: "Hebrew" },
      { isoCode: "hi", name: "Hindi" },
      { isoCode: "hy", name: "Armenian" },
      { isoCode: "ka", name: "Georgian" },
      { isoCode: "pa", name: "Punjabi" },
      { isoCode: "bn", name: "Bengali" },
      { isoCode: "bs", name: "Bosnian" },
      { isoCode: "ch", name: "Chamorro" },
      { isoCode: "be", name: "Belarusian" },
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
                  name="value"
                  onChange={this.props.inputChange}
                  value={this.props.data.value}
                >
                  <option value="">Select Genre</option>
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
            ) : this.props.data.condition === "age_rating" ? (
              <div className="select-wrap">
                <select
                  data-type={this.props.type}
                  data-row={this.props.row}
                  data-item={this.props.item}
                  name="value"
                  onChange={this.props.inputChange}
                  value={this.props.data.value}
                >
                  <option value="">Select Rating</option>
                  {ageRatings.map((ar, i) => {
                    return (
                      <option
                        key={`${fs}__${this.props.item}__ar_${i}`}
                        value={ar.certification}
                      >
                        {ar.certification}
                      </option>
                    );
                  })}
                </select>
              </div>
            ) : this.props.data.condition === "language" ? (
              <div className="select-wrap">
                <select
                  data-type={this.props.type}
                  data-row={this.props.row}
                  data-item={this.props.item}
                  name="value"
                  onChange={this.props.inputChange}
                  value={this.props.data.value}
                >
                  <option value="">Select Language</option>
                  {languages.map((lang, i) => {
                    return (
                      <option
                        key={`${fs}__${this.props.item}__ar_${i}`}
                        value={lang.isoCode}
                      >
                        {lang.name}
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
