const MusicBrainzApi = require("musicbrainz-api").MusicBrainzApi;
const pjson = require("../package.json");
const sanitize = require("sanitize-filename");
const logger = require("../util/logger");

class MusicMeta {
  constructor() {
    this.api = new MusicBrainzApi({
      appName: "petio-api",
      appVersion: pjson.version,
      appContactInfo: "contact@petio.tv",
    });
  }

  async search(query) {
    let term = sanitize(query);
    let res = await this.api.searchArtist(term);
    console.log(res.artists[0].tags);
  }

  async match(name, genres) {
    logger.info(`MB: Attempting to match ${name}`);
    if (!genres) return false;
    // return true;
    let term = sanitize(name);
    try {
      let res = await this.api.searchArtist(term);
      let artists = res.artists;
      if (artists.length === 0) {
        logger.warn(`MB: No match for ${term}`);
        return false;
      }
      let match = false;
      artists.map((artist) => {
        let genreMatch = 0;
        let artistName = artist.name;
        if (match) return;
        let tags = artist.tags;
        for (let t in tags) {
          let tag = tags[t];

          genres.map((genre) => {
            let genresF = this.formatGenre(genre.tag);
            genresF.map((genreF) => {
              if (genreF === tag.name) {
                genreMatch++;
              }
            });
          });
        }
        if (genreMatch > 0 && artistName === name) {
          match = artist;
        }
      });

      if (!match) {
        if (artists[0].score === 100 && artists[0].name === name) {
          match = artists[0];
        }
      }

      return match;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  formatGenre(name) {
    return name.toLowerCase().replace("-", " ").split("/");
  }
}

module.exports = MusicMeta;
