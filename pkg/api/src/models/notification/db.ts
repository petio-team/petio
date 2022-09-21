import { getModelForClass } from '@typegoose/typegoose';

import { RepositoryError } from '../errors';
import { Notification } from './dto';
import { INotificationRepository } from './repo';
import { NotificationSchema } from './schema';

export class NotificationDB implements INotificationRepository {
  private model = getModelForClass(NotificationSchema);

  async GetAll(): Promise<Notification[]> {
    const results = await this.model.find({}).exec();
    return results.map((n) => n.toObject());
  }

  async GetById(id: string): Promise<Notification> {
    const result = await this.model.findOne({ id }).exec();
    if (!result) {
      throw new RepositoryError(
        `failed to get notification by id with id: ${id}`,
      );
    }

    return result.toObject();
  }

  async Create(notification: Notification): Promise<Notification> {
    const result = await this.model.create(notification);
    if (!result) {
      throw new RepositoryError(`failed to create notification`);
    }

    return result.toObject();
  }

  async CreateOrUpdate(url: string, enabled: boolean): Promise<Notification> {
    const result = await this.model
      .findOneAndUpdate(
        {
          url,
        },
        {
          url,
          enabled,
        },
        {
          upsert: true,
        },
      )
      .exec();
    if (!result) {
      throw new RepositoryError(
        `failed to upsert notification with url: ${url}`,
      );
    }

    return result.toObject();
  }

  async UpdateById(notification: Partial<Notification>): Promise<Notification> {
    const { id, ...update } = notification;
    const result = await this.model
      .findOneAndUpdate(
        {
          id,
        },
        update,
      )
      .exec();
    if (!result) {
      throw new RepositoryError(`failed to update notification with id: ${id}`);
    }

    return result.toObject();
  }

  async DeleteById(id: string): Promise<void> {
    const result = await this.model.deleteOne({ id }).exec();
    if (!result.deletedCount) {
      throw new RepositoryError(`failed to delete notifcation with id: ${id}`);
    }
  }
}
