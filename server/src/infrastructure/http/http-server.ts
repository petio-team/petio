import { Service } from 'diod';
import http, { IncomingMessage, Server, ServerResponse } from 'http';
import { promisify } from 'util';

/**
 * Represents an HTTP server.
 */
@Service()
export class HttpServer {
  /**
   * The HTTP server instance.
   *
   * @remarks
   * This property represents the server instance used for handling incoming HTTP requests.
   * It is of type `Server` from the `http` module.
   *
   * @typeParam TIncomingMessage - The type of the incoming HTTP request message.
   * @typeParam TServerResponse - The type of the server response.
   */
  private server: Server<typeof IncomingMessage, typeof ServerResponse>;

  /**
   * Indicates whether the server is currently shutting down.
   */
  private isShuttingDown: any;

  /**
   * The address of the HTTP server.
   */
  private address: string;

  /**
   * The port number on which the HTTP server is listening.
   */
  private port: number;

  /**
   * Starts the HTTP server.
   * @param address - The address to bind the server to.
   * @param port - The port to listen on.
   * @returns A promise that resolves when the server has started successfully.
   */
  async start(
    address: string,
    port: number,
    cb?: (req: IncomingMessage, res: ServerResponse) => void,
  ): Promise<void> {
    this.server = http.createServer(cb || undefined);
    return new Promise((resolve, reject) => {
      this.server.listen(port, address, () => {
        this.address = address;
        this.port = port;
        resolve();
      });
      this.server.once('error', reject);
    });
  }

  /**
   * Stops the HTTP server.
   * @returns A promise that resolves when the server has stopped successfully.
   */
  async stop(): Promise<void> {
    if (this.isShuttingDown) {
      return this.isShuttingDown;
    }
    this.isShuttingDown = promisify(this.server.close.bind(this.server));
    return this.isShuttingDown;
  }

  /**
   * Gets the number of active connections on the server.
   * @returns A promise that resolves with the number of active connections.
   */
  async getConnection(): Promise<number> {
    return promisify(this.server.getConnections.bind(this.server))();
  }

  /**
   * Gets the address that the server is bound to.
   * @returns The server address.
   */
  getAddress(): string {
    return this.address;
  }

  /**
   * Gets the port that the server is listening on.
   * @returns The server port.
   */
  getPort(): number {
    return this.port;
  }

  /**
   * Gets the underlying HTTP server instance.
   * @returns The HTTP server instance.
   */
  getServer(): Server<typeof IncomingMessage, typeof ServerResponse> {
    return this.server;
  }
}
