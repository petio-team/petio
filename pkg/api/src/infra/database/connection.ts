import { Service } from 'diod';
import { Connection } from 'mongoose';

/**
 * Represents an abstract class for a Mongoose database connection.
 */
@Service()
export abstract class MongooseDatabaseConnection {
  abstract get(id?: string): Connection | undefined;
  abstract getOrThrow(id?: string): Connection;
  abstract has(id?: string): boolean;
  abstract connect(
    id: string,
    url: string,
    connectionOptions: any,
    isDefault?: boolean,
  ): Promise<any>;
}
