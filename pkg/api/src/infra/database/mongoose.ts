import { Connection, connect } from 'mongoose';

import { MongoDatabaseConnection } from './connection';
import { DATABASE_URL } from '../config/env';

type MongooseClient = typeof import('mongoose');

export class MongooseDatabase implements MongoDatabaseConnection {
  private client?: MongooseClient;

  constructor(private url: string = DATABASE_URL) {}

  private async getClient(): Promise<MongooseClient> {
    if (this.client) {
      return this.client;
    }
    this.client = await connect(this.url, {
      autoCreate: true,
      autoIndex: true,
      serverSelectionTimeoutMS: 2000,
    });
    return this.client;
  }

  async getConnection(): Promise<Connection> {
    return (await this.getClient()).connection;
  }
}
