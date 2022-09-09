import { IRead, IWrite } from '../base';
import { Notification } from './dto';

export interface INotificationRepository
  extends IWrite<Notification>,
    IRead<Notification> {
  CreateOrUpdate(url: string, enabled: boolean): Promise<Notification>;
}
