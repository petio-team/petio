type ExternalConfig = {
    tmdbApiKey: string;
    fanartApiKey: string;
};

const externalConfig: ExternalConfig = {
  tmdbApiKey: process.env.TMDB_API_KEY || '1af5ad19a2d972a67cd27eb033979c4c',
  fanartApiKey: process.env.FANART_API_KEY || 'ee409f6fb0c5cd2352e7a454d3f580d4',
};

export default externalConfig;
