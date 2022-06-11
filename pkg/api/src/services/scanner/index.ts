export interface IMediaScanner {
  GetLibrary(): Promise<void>;
  GetMetadata(): Promise<void>;
  GetUsers(): Promise<void>;
  GetRecentlyWatched(): Promise<void>;
  GetRecentlyAdded(): Promise<void>;
}
