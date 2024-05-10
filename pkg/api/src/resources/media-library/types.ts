import { Override } from '@/infra/utils/override';

/**
 * Represents the type of media in a library.
 */
export enum MediaLibraryType {
  MOVIE = 'movie',
  SHOW = 'show',
}

/**
 * Represents the properties of a MediaLibrary.
 */
export type MediaLibraryProps = {
  allowSync: boolean;
  art: string;
  composite: string;
  filters: boolean;
  refreshing: boolean;
  thumb: string;
  key: string;
  type: MediaLibraryType;
  title: string;
  agent: string;
  scanner: string;
  language: string;
  uuid: string;
  scannedAt: number;
  content: boolean;
  directory: boolean;
  contentChangedAt: number;
  hidden: number;
};

/**
 * Represents the properties for creating a MediaLibrary.
 */
export type CreateMediaLibraryProps = Override<
  MediaLibraryProps,
  {
    //
  }
>;
