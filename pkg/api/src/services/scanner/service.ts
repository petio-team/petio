import { Logger } from "@/infra/logger/logger";
import { MediaLibraryRepository } from "@/resources/media-library/repository";
import { MediaServerEntity } from "@/resources/media-server/entity";
import { MediaServerRepository } from "@/resources/media-server/repository";
import { ScannerProvider } from "@/services/scanner/provider";
import { scannerProviders } from "@/services/scanner/providers";
import Bluebird from "bluebird";
import { Service } from "diod";
import pino from "pino";

@Service()
export class ScannerService {
  /**
   * The logger used for logging messages in the scanner service.
   */
  private logger: pino.Logger;

  /**
   * Represents the ScannerService class.
   */
  constructor(
    logger: Logger,
    private mediaLibrary: MediaLibraryRepository,
    private mediaServer: MediaServerRepository,
  ) {
    this.logger = logger.child({ module: "services.scanner" });
  }

  /**
   * Retrieves the scanner provider for the given media server.
   *
   * @param server The media server entity.
   * @returns The scanner provider instance or null if no provider is found.
   */
  private getProvider(server: MediaServerEntity): ScannerProvider | null {
    const provider = scannerProviders[server.type];
    if (!provider) {
      this.logger.debug(`No provider found for ${server.type}`);
      return null;
    }
    // eslint-disable-next-line new-cap
    return new provider(server, this.logger);
  }

  /**
   * Synchronizes libraries between media servers and the media library repository.
   *
   * Retrieves libraries from each media server, compares them with the existing libraries in the repository,
   * and performs necessary operations (add, update, delete) to keep the libraries in sync.
   */
  async syncLibraries() {
    const servers = await this.mediaServer.findAll();
    await Bluebird.map(servers, async (server) => {
      const provider = this.getProvider(server);
      if (!provider) {
        return;
      }
      try {
        const [providerLibraries, repositoryLibraries] = await Promise.all([
          provider.getLibraries(),
          this.mediaLibrary.findAll({}),
        ]);
        const newLibraries = providerLibraries.filter((library) => !repositoryLibraries.some((repoLibrary) => repoLibrary.uuid === library.uuid));
        const updatedLibraries = providerLibraries.filter((library) => repositoryLibraries.some((repoLibrary) => repoLibrary.uuid === library.uuid));
        const deletedLibraries = repositoryLibraries.filter((library) => !providerLibraries.some((repoLibrary) => repoLibrary.uuid === library.uuid));

        this.logger.debug(`library ${server.id} stats - added: ${newLibraries.length}, updated: ${updatedLibraries.length}, deleted: ${deletedLibraries.length}`);

        await Promise.all([
          this.mediaLibrary.deleteManyByIds(deletedLibraries.map(library => library.id)),
          this.mediaLibrary.createMany(newLibraries),
          ...updatedLibraries.map(async (l) => this.mediaLibrary.updateMany({ id: l.id }, { ...l, createdAt: undefined })),
        ]);
      } catch (error) {
        this.logger.error(error, `Failed to sync libraries for server ${server.id}`);
      }
    }, { concurrency: 1 });
  }
}
