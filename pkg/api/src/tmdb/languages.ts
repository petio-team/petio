//
//  A list of iso-639-1 codes can be found on the tmdb api page
//  https://developers.themoviedb.org/3/configuration/get-languages
//

// Stores a list of languages with there associated iso codes
const languages = [
  { code: "aa", name: "Afar" },
  { code: "af", name: "Afrikaans" },
  { code: "ak", name: "Akan" },
  { code: "an", name: "Aragonese" },
  { code: "as", name: "Assamese" },
  { code: "av", name: "Avaric" },
  { code: "ae", name: "Avestan" },
  { code: "ay", name: "Aymara" },
  { code: "az", name: "Azerbaijani" },
  { code: "ba", name: "Bashkir" },
  { code: "bm", name: "Bambara" },
  { code: "bi", name: "Bislama" },
  { code: "bo", name: "Tibetan" },
  { code: "br", name: "Breton" },
  { code: "ca", name: "Catalan" },
  { code: "cs", name: "Czech" },
  { code: "ce", name: "Chechen" },
  { code: "cu", name: "Slavic" },
  { code: "cv", name: "Chuvash" },
  { code: "kw", name: "Cornish" },
  { code: "co", name: "Corsican" },
  { code: "cr", name: "Cree" },
  { code: "cy", name: "Welsh" },
  { code: "da", name: "Danish" },
  { code: "de", name: "German" },
  { code: "dv", name: "Divehi" },
  { code: "dz", name: "Dzongkha" },
  { code: "ee", name: "Ewe" },
  { code: "en", name: "English" },
  { code: "eo", name: "Esperanto" },
  { code: "et", name: "Estonian" },
  { code: "eu", name: "Basque" },
  { code: "fo", name: "Faroese" },
  { code: "fj", name: "Fijian" },
  { code: "fi", name: "Finnish" },
  { code: "fr", name: "French" },
  { code: "fy", name: "Frisian" },
  { code: "ff", name: "Fulah" },
  { code: "gd", name: "Gaelic" },
  { code: "ga", name: "Irish" },
  { code: "gl", name: "Gallegan" },
  { code: "gv", name: "Manx" },
  { code: "gu", name: "Gujarati" },
  { code: "ht", name: "Haitian" },
  { code: "ha", name: "Hausa" },
  { code: "sh", name: "Serbo-Croatian" },
  { code: "hz", name: "Herero" },
  { code: "ho", name: "Hiri Motu" },
  { code: "hr", name: "Croatian" },
  { code: "hu", name: "Hungarian" },
  { code: "ig", name: "Igbo" },
  { code: "io", name: "Ido" },
  { code: "ii", name: "Yi" },
  { code: "iu", name: "Inuktitut" },
  { code: "ie", name: "Interlingue" },
  { code: "ia", name: "Interlingua" },
  { code: "id", name: "Indonesian" },
  { code: "ik", name: "Inupiaq" },
  { code: "is", name: "Icelandic" },
  { code: "it", name: "Italian" },
  { code: "jv", name: "Javanese" },
  { code: "ja", name: "Japanese" },
  { code: "kl", name: "Kalaallisut" },
  { code: "kn", name: "Kannada" },
  { code: "ks", name: "Kashmiri" },
  { code: "kr", name: "Kanuri" },
  { code: "kk", name: "Kazakh" },
  { code: "km", name: "Khmer" },
  { code: "ki", name: "Kikuyu" },
  { code: "rw", name: "Kinyarwanda" },
  { code: "ky", name: "Kirghiz" },
  { code: "kv", name: "Komi" },
  { code: "kg", name: "Kongo" },
  { code: "ko", name: "Korean" },
  { code: "kj", name: "Kuanyama" },
  { code: "lo", name: "Lao" },
  { code: "la", name: "Latin" },
  { code: "lv", name: "Latvian" },
  { code: "li", name: "Limburgish" },
  { code: "ln", name: "Lingala" },
  { code: "lt", name: "Lithuanian" },
  { code: "lb", name: "Letzeburgesch" },
  { code: "lu", name: "Luba-Katanga" },
  { code: "lg", name: "Gandaa" },
  { code: "mh", name: "Marshall" },
  { code: "ml", name: "Malayalam" },
  { code: "mr", name: "Marathi" },
  { code: "mg", name: "Malagasy" },
  { code: "mt", name: "Maltese" },
  { code: "mo", name: "Moldavian" },
  { code: "mn", name: "Mongolian" },
  { code: "mi", name: "Maori" },
  { code: "ms", name: "Malay" },
  { code: "my", name: "Burmese" },
  { code: "na", name: "Nauru" },
  { code: "nv", name: "Navajo" },
  { code: "nr", name: "Ndebele (nr)" },
  { code: "nd", name: "Ndebele (nd)" },
  { code: "ne", name: "Nepali" },
  { code: "nl", name: "Dutch" },
  { code: "nn", name: "Norwegian Nynorsk" },
  { code: "nb", name: "Norwegian Bokmål" },
  { code: "no", name: "Norwegian" },
  { code: "ny", name: "Chichewa; Nyanja" },
  { code: "oc", name: "Occitan" },
  { code: "oj", name: "Ojibwa" },
  { code: "or", name: "Oriya" },
  { code: "om", name: "Oromo" },
  { code: "os", name: "Ossetian; Ossetic" },
  { code: "pi", name: "Pali" },
  { code: "pl", name: "Polish"},
  { code: "pt", name: "Portuguese" },
  { code: "qu", name: "Quechua" },
  { code: "rm", name: "Raeto-Romance" },
  { code: "ro", name: "Romanian" },
  { code: "rn", name: "Rundi" },
  { code: "ru", name: "Russian" },
  { code: "sg", name: "Sango" },
  { code: "sa", name: "Sanskrit" },
  { code: "si", name: "Sinhalese" },
  { code: "sk", name: "Slovak" },
  { code: "sl", name: "Slovenian" },
  { code: "se", name: "Northern Sami" },
  { code: "sm", name: "Samoan" },
  { code: "sn", name: "Shona" },
  { code: "sd", name: "Sindhi" },
  { code: "so", name: "Somali" },
  { code: "st", name: "Sotho" },
  { code: "es", name: "Spanish" },
  { code: "sq", name: "Albanian" },
  { code: "sc", name: "Sardinian" },
  { code: "sr", name: "Serbian" },
  { code: "ss", name: "Swati" },
  { code: "su", name: "Sundanese" },
  { code: "sw", name: "Swahili" },
  { code: "sv", name: "Swedish" },
  { code: "ty", name: "Tahitian" },
  { code: "ta", name: "Tamil" },
  { code: "tt", name: "Tatar" },
  { code: "te", name: "Telugu" },
  { code: "tg", name: "Tajik" },
  { code: "tl", name: "Tagalog" },
  { code: "th", name: "Thai" },
  { code: "ti", name: "Tigrinya" },
  { code: "to", name: "Tonga" },
  { code: "tn", name: "Tswana" },
  { code: "ts", name: "Tsonga" },
  { code: "tk", name: "Turkmen" },
  { code: "tr", name: "Turkish" },
  { code: "tw", name: "Twi" },
  { code: "ug", name: "Uighur" },
  { code: "uk", name: "Ukrainian" },
  { code: "ur", name: "Urdu" },
  { code: "ve", name: "Venda" },
  { code: "vi", name: "Vietnamese" },
  { code: "vo", name: "Volapük" },
  { code: "wa", name: "Walloon" },
  { code: "wo", name: "Wolof" },
  { code: "xh", name: "Xhosa" },
  { code: "yi", name: "Yiddish" },
  { code: "za", name: "Zhuang" },
  { code: "zu", name: "Zulu" },
  { code: "ab", name: "Abkhazian" },
  { code: "zh", name: "Mandarin" },
  { code: "ps", name: "Pushto" },
  { code: "am", name: "Amharic" },
  { code: "ar", name: "Arabic" },
  { code: "bg", name: "Bulgarian" },
  { code: "cn", name: "Cantonese" },
  { code: "mk", name: "Macedonian" },
  { code: "el", name: "Greek" },
  { code: "fa", name: "Persian" },
  { code: "he", name: "Hebrew" },
  { code: "hi", name: "Hindi" },
  { code: "hy", name: "Armenian" },
  { code: "ka", name: "Georgian" },
  { code: "pa", name: "Punjabi" },
  { code: "bn", name: "Bengali" },
  { code: "bs", name: "Bosnian" },
  { code: "ch", name: "Chamorro" },
  { code: "be", name: "Belarusian" },
];

/**
 * @description Returns a languages name based on the
 *              iso639-1 code provided
 * @param string iso639-1 code
 * @returns string A language name
 */
export default (code: string): string => {
  var language = languages.
    filter(lang => lang.code === code).
    map(lang => lang.code);

  return language[0] ?? "Unknown";
}