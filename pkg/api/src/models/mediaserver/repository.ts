import { IMediaServer, MediaServerID, MediaServerType } from './dto';
import { RepositoryError } from './errors';

export interface IMediaServerRepository {
  findById(id: string, deleted?: true): Promise<IMediaServer | RepositoryError>;
  findByType(type: MediaServerType, deleted?: boolean): Promise<IMediaServer[]>;
  getAll(deleted?: boolean): Promise<IMediaServer[]>;
  create(
    type: MediaServerType,
    name: string,
    url: URL,
    token: string,
    enabled: boolean,
  ): Promise<IMediaServer | RepositoryError>;
  updateById(
    id: MediaServerID,
    name?: string,
    url?: URL,
    token?: string,
    enabled?: boolean,
  ): Promise<IMediaServer | RepositoryError>;
  createOrUpdate(
    id: MediaServerID,
    type: MediaServerType,
    name: string,
    url: URL,
    token: string,
    enabled: boolean,
  ): Promise<IMediaServer | RepositoryError>;
  deleteById(id: MediaServerID): Promise<IMediaServer | RepositoryError>;
  removeById(id: MediaServerID): Promise<boolean | RepositoryError>;
  restoreById(id: MediaServerID): Promise<IMediaServer | RepositoryError>;
}
