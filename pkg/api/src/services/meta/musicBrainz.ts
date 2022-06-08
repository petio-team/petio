import api from 'musicbrainz-api';
import sanitize from 'sanitize-filename';

import pkg from '@/../package.json';
import logger from '@/loaders/logger';

export default class MusicMeta {
  api: any;
  constructor() {
    this.api = new api.MusicBrainzApi({
      appName: 'petio-api',
      appVersion: pkg.version,
      appContactInfo: 'contact@petio.tv',
    });
  }

  async search(query) {
    let term = sanitize(query);
    let res = await this.api.searchArtist(term);
  }

  async match(name, genres) {
    logger.info(`MB: Attempting to match ${name}`, {
      label: 'meta.musicbrainz',
    });
    if (!genres) return { id: 'no genres', title: false };
    // return true;
    let term = sanitize(name);
    try {
      let res = await this.api.searchArtist(term);
      let artists = res.artists;
      if (artists.length === 0) {
        logger.warn(`MB: No match for ${term}`, { label: 'meta.musicbrainz' });
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

      if (!match) {
        return { id: 'no match', title: false };
      }
      return match;
    } catch (e) {
      logger.error(e, { label: 'meta.musicbrainz' });
      return { id: 'error', title: false };
    }
  }

  formatGenre(name) {
    return name.toLowerCase().replace('-', ' ').split('/');
  }
}
