export type Status = {
  name: string;
  version: string;
}

export type SeriesType = {
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

export type Series = {
  id: number;
  title: string;
  status: string;
  airTime: string;
};

export type Calendar = {
  type: string;
  id: number,
  title: string,
  airDate: string;
  seasonNumber: number;
  episodeNumber: number;
  tvdbid: number,
}
