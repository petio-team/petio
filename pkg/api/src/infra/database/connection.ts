import { Connection } from 'mongoose';

export abstract class MongoDatabaseConnection {
  abstract getConnection(): Promise<Connection>;
}
