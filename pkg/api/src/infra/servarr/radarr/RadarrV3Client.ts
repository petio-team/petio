import { AxiosHttpRequest } from './core/AxiosHttpRequest';
import type { BaseHttpRequest } from './core/BaseHttpRequest';
import type { OpenAPIConfig } from './core/OpenAPI';
import { Interceptors } from './core/OpenAPI';
import {
  AlternativeTitleService,
  ApiInfoService,
  AuthenticationService,
  AutoTaggingService,
  BackupService,
  BlocklistService,
  CalendarFeedService,
  CalendarService,
  CollectionService,
  CommandService,
  CreditService,
  CustomFilterService,
  CustomFormatService,
  DelayProfileService,
  DiskSpaceService,
  DownloadClientConfigService,
  DownloadClientService,
  ExtraFileService,
  FileSystemService,
  HealthService,
  HistoryService,
  HostConfigService,
  ImportExclusionsService,
  ImportListConfigService,
  ImportListMoviesService,
  ImportListService,
  IndexerConfigService,
  IndexerFlagService,
  IndexerService,
  LanguageService,
  LocalizationService,
  LogFileService,
  LogService,
  ManualImportService,
  MediaCoverService,
  MediaManagementConfigService,
  MetadataConfigService,
  MetadataService,
  MovieEditorService,
  MovieFileService,
  MovieImportService,
  MovieLookupService,
  MovieService,
  NamingConfigService,
  NotificationService,
  ParseService,
  PingService,
  QualityDefinitionService,
  QualityProfileSchemaService,
  QualityProfileService,
  QueueActionService,
  QueueDetailsService,
  QueueService,
  QueueStatusService,
  ReleaseProfileService,
  ReleasePushService,
  ReleaseService,
  RemotePathMappingService,
  RenameMovieService,
  RootFolderService,
  StaticResourceService,
  SystemService,
  TagDetailsService,
  TagService,
  TaskService,
  UiConfigService,
  UpdateLogFileService,
  UpdateService,
} from './services.gen';

type HttpRequestConstructor = new (config: OpenAPIConfig) => BaseHttpRequest;

export class RadarrV3Client {
  public readonly alternativeTitle: AlternativeTitleService;

  public readonly apiInfo: ApiInfoService;

  public readonly authentication: AuthenticationService;

  public readonly autoTagging: AutoTaggingService;

  public readonly backup: BackupService;

  public readonly blocklist: BlocklistService;

  public readonly calendar: CalendarService;

  public readonly calendarFeed: CalendarFeedService;

  public readonly collection: CollectionService;

  public readonly command: CommandService;

  public readonly credit: CreditService;

  public readonly customFilter: CustomFilterService;

  public readonly customFormat: CustomFormatService;

  public readonly delayProfile: DelayProfileService;

  public readonly diskSpace: DiskSpaceService;

  public readonly downloadClient: DownloadClientService;

  public readonly downloadClientConfig: DownloadClientConfigService;

  public readonly extraFile: ExtraFileService;

  public readonly fileSystem: FileSystemService;

  public readonly health: HealthService;

  public readonly history: HistoryService;

  public readonly hostConfig: HostConfigService;

  public readonly importExclusions: ImportExclusionsService;

  public readonly importList: ImportListService;

  public readonly importListConfig: ImportListConfigService;

  public readonly importListMovies: ImportListMoviesService;

  public readonly indexer: IndexerService;

  public readonly indexerConfig: IndexerConfigService;

  public readonly indexerFlag: IndexerFlagService;

  public readonly language: LanguageService;

  public readonly localization: LocalizationService;

  public readonly log: LogService;

  public readonly logFile: LogFileService;

  public readonly manualImport: ManualImportService;

  public readonly mediaCover: MediaCoverService;

  public readonly mediaManagementConfig: MediaManagementConfigService;

  public readonly metadata: MetadataService;

  public readonly metadataConfig: MetadataConfigService;

  public readonly movie: MovieService;

  public readonly movieEditor: MovieEditorService;

  public readonly movieFile: MovieFileService;

  public readonly movieImport: MovieImportService;

  public readonly movieLookup: MovieLookupService;

  public readonly namingConfig: NamingConfigService;

  public readonly notification: NotificationService;

  public readonly parse: ParseService;

  public readonly ping: PingService;

  public readonly qualityDefinition: QualityDefinitionService;

  public readonly qualityProfile: QualityProfileService;

  public readonly qualityProfileSchema: QualityProfileSchemaService;

  public readonly queue: QueueService;

  public readonly queueAction: QueueActionService;

  public readonly queueDetails: QueueDetailsService;

  public readonly queueStatus: QueueStatusService;

  public readonly release: ReleaseService;

  public readonly releaseProfile: ReleaseProfileService;

  public readonly releasePush: ReleasePushService;

  public readonly remotePathMapping: RemotePathMappingService;

  public readonly renameMovie: RenameMovieService;

  public readonly rootFolder: RootFolderService;

  public readonly staticResource: StaticResourceService;

  public readonly system: SystemService;

  public readonly tag: TagService;

  public readonly tagDetails: TagDetailsService;

  public readonly task: TaskService;

  public readonly uiConfig: UiConfigService;

  public readonly update: UpdateService;

  public readonly updateLogFile: UpdateLogFileService;

  public readonly request: BaseHttpRequest;

  constructor(
    config?: Partial<OpenAPIConfig>,
    HttpRequest: HttpRequestConstructor = AxiosHttpRequest,
  ) {
    this.request = new HttpRequest({
      BASE: config?.BASE ?? 'http://localhost:7878',
      VERSION: config?.VERSION ?? '3.0.0',
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

    this.alternativeTitle = new AlternativeTitleService(this.request);
    this.apiInfo = new ApiInfoService(this.request);
    this.authentication = new AuthenticationService(this.request);
    this.autoTagging = new AutoTaggingService(this.request);
    this.backup = new BackupService(this.request);
    this.blocklist = new BlocklistService(this.request);
    this.calendar = new CalendarService(this.request);
    this.calendarFeed = new CalendarFeedService(this.request);
    this.collection = new CollectionService(this.request);
    this.command = new CommandService(this.request);
    this.credit = new CreditService(this.request);
    this.customFilter = new CustomFilterService(this.request);
    this.customFormat = new CustomFormatService(this.request);
    this.delayProfile = new DelayProfileService(this.request);
    this.diskSpace = new DiskSpaceService(this.request);
    this.downloadClient = new DownloadClientService(this.request);
    this.downloadClientConfig = new DownloadClientConfigService(this.request);
    this.extraFile = new ExtraFileService(this.request);
    this.fileSystem = new FileSystemService(this.request);
    this.health = new HealthService(this.request);
    this.history = new HistoryService(this.request);
    this.hostConfig = new HostConfigService(this.request);
    this.importExclusions = new ImportExclusionsService(this.request);
    this.importList = new ImportListService(this.request);
    this.importListConfig = new ImportListConfigService(this.request);
    this.importListMovies = new ImportListMoviesService(this.request);
    this.indexer = new IndexerService(this.request);
    this.indexerConfig = new IndexerConfigService(this.request);
    this.indexerFlag = new IndexerFlagService(this.request);
    this.language = new LanguageService(this.request);
    this.localization = new LocalizationService(this.request);
    this.log = new LogService(this.request);
    this.logFile = new LogFileService(this.request);
    this.manualImport = new ManualImportService(this.request);
    this.mediaCover = new MediaCoverService(this.request);
    this.mediaManagementConfig = new MediaManagementConfigService(this.request);
    this.metadata = new MetadataService(this.request);
    this.metadataConfig = new MetadataConfigService(this.request);
    this.movie = new MovieService(this.request);
    this.movieEditor = new MovieEditorService(this.request);
    this.movieFile = new MovieFileService(this.request);
    this.movieImport = new MovieImportService(this.request);
    this.movieLookup = new MovieLookupService(this.request);
    this.namingConfig = new NamingConfigService(this.request);
    this.notification = new NotificationService(this.request);
    this.parse = new ParseService(this.request);
    this.ping = new PingService(this.request);
    this.qualityDefinition = new QualityDefinitionService(this.request);
    this.qualityProfile = new QualityProfileService(this.request);
    this.qualityProfileSchema = new QualityProfileSchemaService(this.request);
    this.queue = new QueueService(this.request);
    this.queueAction = new QueueActionService(this.request);
    this.queueDetails = new QueueDetailsService(this.request);
    this.queueStatus = new QueueStatusService(this.request);
    this.release = new ReleaseService(this.request);
    this.releaseProfile = new ReleaseProfileService(this.request);
    this.releasePush = new ReleasePushService(this.request);
    this.remotePathMapping = new RemotePathMappingService(this.request);
    this.renameMovie = new RenameMovieService(this.request);
    this.rootFolder = new RootFolderService(this.request);
    this.staticResource = new StaticResourceService(this.request);
    this.system = new SystemService(this.request);
    this.tag = new TagService(this.request);
    this.tagDetails = new TagDetailsService(this.request);
    this.task = new TaskService(this.request);
    this.uiConfig = new UiConfigService(this.request);
    this.update = new UpdateService(this.request);
    this.updateLogFile = new UpdateLogFileService(this.request);
  }
}
