import { AxiosHttpRequest } from './core/AxiosHttpRequest';
import type { BaseHttpRequest } from './core/BaseHttpRequest';
import type { OpenAPIConfig } from './core/OpenAPI';
import { Interceptors } from './core/OpenAPI';
import {
  ActivitiesService,
  AuthenticationService,
  ButlerService,
  HubsService,
  LibraryService,
  LogService,
  MediaService,
  PlaylistsService,
  PlexService,
  SearchService,
  ServerService,
  SessionsService,
  StatisticsService,
  UpdaterService,
  VideoService,
} from './services.gen';

type HttpRequestConstructor = new (config: OpenAPIConfig) => BaseHttpRequest;

export class PlexClient {
  public readonly activities: ActivitiesService;

  public readonly authentication: AuthenticationService;

  public readonly butler: ButlerService;

  public readonly hubs: HubsService;

  public readonly library: LibraryService;

  public readonly log: LogService;

  public readonly media: MediaService;

  public readonly playlists: PlaylistsService;

  public readonly plex: PlexService;

  public readonly search: SearchService;

  public readonly server: ServerService;

  public readonly sessions: SessionsService;

  public readonly statistics: StatisticsService;

  public readonly updater: UpdaterService;

  public readonly video: VideoService;

  public readonly request: BaseHttpRequest;

  constructor(
    config?: Partial<OpenAPIConfig>,
    HttpRequest: HttpRequestConstructor = AxiosHttpRequest,
  ) {
    this.request = new HttpRequest({
      BASE: config?.BASE ?? 'http://10.10.10.47:32400',
      VERSION: config?.VERSION ?? '0.0.3',
      WITH_CREDENTIALS: config?.WITH_CREDENTIALS ?? false,
      CREDENTIALS: config?.CREDENTIALS ?? 'include',
      TOKEN: config?.TOKEN,
      USERNAME: config?.USERNAME,
      PASSWORD: config?.PASSWORD,
      HEADERS: config?.HEADERS,
      ENCODE_PATH: config?.ENCODE_PATH,
      interceptors: {
        request: config?.interceptors?.request ?? new Interceptors(),
        response: config?.interceptors?.response ?? new Interceptors(),
      },
    });

    this.activities = new ActivitiesService(this.request);
    this.authentication = new AuthenticationService(this.request);
    this.butler = new ButlerService(this.request);
    this.hubs = new HubsService(this.request);
    this.library = new LibraryService(this.request);
    this.log = new LogService(this.request);
    this.media = new MediaService(this.request);
    this.playlists = new PlaylistsService(this.request);
    this.plex = new PlexService(this.request);
    this.search = new SearchService(this.request);
    this.server = new ServerService(this.request);
    this.sessions = new SessionsService(this.request);
    this.statistics = new StatisticsService(this.request);
    this.updater = new UpdaterService(this.request);
    this.video = new VideoService(this.request);
  }
}
