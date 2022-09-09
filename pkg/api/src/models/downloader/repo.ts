import { IRead, IWrite } from '../base';
import { Downloader } from './dto';

export interface IDownloaderRepository
  extends IWrite<Downloader>,
    IRead<Downloader> {
  GetByType(type: string): Promise<Downloader[]>;
}
