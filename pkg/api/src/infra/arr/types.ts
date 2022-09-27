export type Status = {
  name: string;
  version: string;
}

export type Availability = {
  id: number;
  name: string;
};

export type RootPath = {
  id: number;
  path: string;
};

export type QualityProfile = {
  id: number;
  name: string;
};

export type LanguageProfile = {
  id: number;
  name: string;
};

export type Tag = {
  id: number;
  name: string;
}

export type Queue = {
  page: number;
  size: number;
  total: number;
  items: QueueItem[],
};

export type QueueItem = {
  id: number;
  status: string;
}

export enum MediaType {
  Movie = 'movie',
  Show = 'show',
};

export type Media = {
  id: number;
  title: string;
  status: string;
  airTime: string;
  type: MediaType;
};

export type Calendar = {
  id: number,
  title: string,
  airDate: string;
  show?: {
    seasonNumber: number;
    episodeNumber: number;
    tvdbid: number,
  },
  movie?: {
    tmdbid: number,
  }
}
