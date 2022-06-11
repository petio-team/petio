import { IMediaServer, MediaServerID, MediaServerType } from './dto';

export enum RepositoryError {
  NotFound = 'no media server was found',
  NotCreated = 'failed to create a new media server instance',
  NotUpdated = 'failed to update a media server instance',
  NotCreatedOrUpdated = 'failed to create or update media server instance',
  NotDeleted = 'failed to soft delete the server instance',
  NotRemoved = 'failed to remove the server instance',
  NotRestored = 'failed to restore the server instance',
}

export interface IMediaServerRepository {
  findById(id: string, filters: Object): Promise<IMediaServer>;
  findByType(type: MediaServerType, filters: Object): Promise<IMediaServer[]>;
  findByFilter(filters: Object): Promise<IMediaServer>;
  getAll(filters: Object): Promise<IMediaServer[]>;
  create(
    type: MediaServerType,
    name: string,
    url: URL,
    token: string,
    enabled: boolean,
  ): Promise<IMediaServer>;
  updateById(
    id: MediaServerID,
    name?: string,
    url?: URL,
    token?: string,
    enabled?: boolean,
  ): Promise<IMediaServer>;
  createOrUpdate(
    id: MediaServerID,
    type: MediaServerType,
    name: string,
    url: URL,
    token: string,
    enabled: boolean,
  ): Promise<IMediaServer>;
  deleteById(id: MediaServerID): Promise<IMediaServer>;
  removeById(id: MediaServerID): Promise<boolean>;
  restoreById(id: MediaServerID): Promise<IMediaServer>;
}
