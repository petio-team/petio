import { ConnectOptions, Connection, createConnection } from 'mongoose';

import { Service } from 'diod';
import { Logger } from '../logger/logger';
import { MongooseDatabaseConnection } from './connection';

function asPromise(c: any) {
  return c && c.asPromise ? c.asPromise() : c;
}

@Service()
export class MongooseDatabase implements MongooseDatabaseConnection {
  readonly connections: Map<string, Connection> = new Map();

  private defaultConnection: string = 'default';

  constructor(private logger: Logger) {}

  async connect(
    id: string,
    url: string,
    connectionOptions: ConnectOptions,
    isDefault = false,
  ): Promise<any> {
    if (this.has(id)) {
      return this.get(id);
    }

    try {
      const connection = await asPromise(
        createConnection(url, connectionOptions),
      );
      this.connections.set(id, connection);

      if (id === 'default' || isDefault) {
        this.defaultConnection = id;
      }

      return connection;
    } catch (error) {
      this.logger.error(`Failed to connect to database`, error);
    }
    return undefined;
  }

  get(id?: string): Connection | undefined {
    return this.connections.get(id || this.defaultConnection);
  }

  getOrThrow(id?: string): Connection {
    const connection = this.get(id);
    if (!connection) {
      throw new Error(`Connection ${id || 'default'} not found`);
    }
    return connection;
  }

  has(id?: string): boolean {
    return this.connections.has(id || this.defaultConnection);
  }
}
