import type { BaseHttpRequest } from './core/BaseHttpRequest';
import type { OpenAPIConfig } from './core/OpenAPI';
import { Interceptors } from './core/OpenAPI';
import { AxiosHttpRequest } from './core/AxiosHttpRequest';

import { ApiInfoService } from './services.gen';
import { AuthenticationService } from './services.gen';
import { AutoTaggingService } from './services.gen';
import { BackupService } from './services.gen';
import { BlocklistService } from './services.gen';
import { CalendarService } from './services.gen';
import { CalendarFeedService } from './services.gen';
import { CommandService } from './services.gen';
import { CustomFilterService } from './services.gen';
import { CustomFormatService } from './services.gen';
import { CutoffService } from './services.gen';
import { DelayProfileService } from './services.gen';
import { DiskSpaceService } from './services.gen';
import { DownloadClientService } from './services.gen';
import { DownloadClientConfigService } from './services.gen';
import { EpisodeService } from './services.gen';
import { EpisodeFileService } from './services.gen';
import { FileSystemService } from './services.gen';
import { HealthService } from './services.gen';
import { HistoryService } from './services.gen';
import { HostConfigService } from './services.gen';
import { ImportListService } from './services.gen';
import { ImportListConfigService } from './services.gen';
import { ImportListExclusionService } from './services.gen';
import { IndexerService } from './services.gen';
import { IndexerConfigService } from './services.gen';
import { IndexerFlagService } from './services.gen';
import { LanguageService } from './services.gen';
import { LanguageProfileService } from './services.gen';
import { LanguageProfileSchemaService } from './services.gen';
import { LocalizationService } from './services.gen';
import { LogService } from './services.gen';
import { LogFileService } from './services.gen';
import { ManualImportService } from './services.gen';
import { MediaCoverService } from './services.gen';
import { MediaManagementConfigService } from './services.gen';
import { MetadataService } from './services.gen';
import { MissingService } from './services.gen';
import { NamingConfigService } from './services.gen';
import { NotificationService } from './services.gen';
import { ParseService } from './services.gen';
import { PingService } from './services.gen';
import { QualityDefinitionService } from './services.gen';
import { QualityProfileService } from './services.gen';
import { QualityProfileSchemaService } from './services.gen';
import { QueueService } from './services.gen';
import { QueueActionService } from './services.gen';
import { QueueDetailsService } from './services.gen';
import { QueueStatusService } from './services.gen';
import { ReleaseService } from './services.gen';
import { ReleaseProfileService } from './services.gen';
import { ReleasePushService } from './services.gen';
import { RemotePathMappingService } from './services.gen';
import { RenameEpisodeService } from './services.gen';
import { RootFolderService } from './services.gen';
import { SeasonPassService } from './services.gen';
import { SeriesService } from './services.gen';
import { SeriesEditorService } from './services.gen';
import { SeriesImportService } from './services.gen';
import { SeriesLookupService } from './services.gen';
import { StaticResourceService } from './services.gen';
import { SystemService } from './services.gen';
import { TagService } from './services.gen';
import { TagDetailsService } from './services.gen';
import { TaskService } from './services.gen';
import { UiConfigService } from './services.gen';
import { UpdateService } from './services.gen';
import { UpdateLogFileService } from './services.gen';

type HttpRequestConstructor = new (config: OpenAPIConfig) => BaseHttpRequest;

export class SonarrV3Client {

	public readonly apiInfo: ApiInfoService;
	public readonly authentication: AuthenticationService;
	public readonly autoTagging: AutoTaggingService;
	public readonly backup: BackupService;
	public readonly blocklist: BlocklistService;
	public readonly calendar: CalendarService;
	public readonly calendarFeed: CalendarFeedService;
	public readonly command: CommandService;
	public readonly customFilter: CustomFilterService;
	public readonly customFormat: CustomFormatService;
	public readonly cutoff: CutoffService;
	public readonly delayProfile: DelayProfileService;
	public readonly diskSpace: DiskSpaceService;
	public readonly downloadClient: DownloadClientService;
	public readonly downloadClientConfig: DownloadClientConfigService;
	public readonly episode: EpisodeService;
	public readonly episodeFile: EpisodeFileService;
	public readonly fileSystem: FileSystemService;
	public readonly health: HealthService;
	public readonly history: HistoryService;
	public readonly hostConfig: HostConfigService;
	public readonly importList: ImportListService;
	public readonly importListConfig: ImportListConfigService;
	public readonly importListExclusion: ImportListExclusionService;
	public readonly indexer: IndexerService;
	public readonly indexerConfig: IndexerConfigService;
	public readonly indexerFlag: IndexerFlagService;
	public readonly language: LanguageService;
	public readonly languageProfile: LanguageProfileService;
	public readonly languageProfileSchema: LanguageProfileSchemaService;
	public readonly localization: LocalizationService;
	public readonly log: LogService;
	public readonly logFile: LogFileService;
	public readonly manualImport: ManualImportService;
	public readonly mediaCover: MediaCoverService;
	public readonly mediaManagementConfig: MediaManagementConfigService;
	public readonly metadata: MetadataService;
	public readonly missing: MissingService;
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
	public readonly renameEpisode: RenameEpisodeService;
	public readonly rootFolder: RootFolderService;
	public readonly seasonPass: SeasonPassService;
	public readonly series: SeriesService;
	public readonly seriesEditor: SeriesEditorService;
	public readonly seriesImport: SeriesImportService;
	public readonly seriesLookup: SeriesLookupService;
	public readonly staticResource: StaticResourceService;
	public readonly system: SystemService;
	public readonly tag: TagService;
	public readonly tagDetails: TagDetailsService;
	public readonly task: TaskService;
	public readonly uiConfig: UiConfigService;
	public readonly update: UpdateService;
	public readonly updateLogFile: UpdateLogFileService;

	public readonly request: BaseHttpRequest;

	constructor(config?: Partial<OpenAPIConfig>, HttpRequest: HttpRequestConstructor = AxiosHttpRequest) {
		this.request = new HttpRequest({
			BASE: config?.BASE ?? 'http://localhost:8989',
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

		this.apiInfo = new ApiInfoService(this.request);
		this.authentication = new AuthenticationService(this.request);
		this.autoTagging = new AutoTaggingService(this.request);
		this.backup = new BackupService(this.request);
		this.blocklist = new BlocklistService(this.request);
		this.calendar = new CalendarService(this.request);
		this.calendarFeed = new CalendarFeedService(this.request);
		this.command = new CommandService(this.request);
		this.customFilter = new CustomFilterService(this.request);
		this.customFormat = new CustomFormatService(this.request);
		this.cutoff = new CutoffService(this.request);
		this.delayProfile = new DelayProfileService(this.request);
		this.diskSpace = new DiskSpaceService(this.request);
		this.downloadClient = new DownloadClientService(this.request);
		this.downloadClientConfig = new DownloadClientConfigService(this.request);
		this.episode = new EpisodeService(this.request);
		this.episodeFile = new EpisodeFileService(this.request);
		this.fileSystem = new FileSystemService(this.request);
		this.health = new HealthService(this.request);
		this.history = new HistoryService(this.request);
		this.hostConfig = new HostConfigService(this.request);
		this.importList = new ImportListService(this.request);
		this.importListConfig = new ImportListConfigService(this.request);
		this.importListExclusion = new ImportListExclusionService(this.request);
		this.indexer = new IndexerService(this.request);
		this.indexerConfig = new IndexerConfigService(this.request);
		this.indexerFlag = new IndexerFlagService(this.request);
		this.language = new LanguageService(this.request);
		this.languageProfile = new LanguageProfileService(this.request);
		this.languageProfileSchema = new LanguageProfileSchemaService(this.request);
		this.localization = new LocalizationService(this.request);
		this.log = new LogService(this.request);
		this.logFile = new LogFileService(this.request);
		this.manualImport = new ManualImportService(this.request);
		this.mediaCover = new MediaCoverService(this.request);
		this.mediaManagementConfig = new MediaManagementConfigService(this.request);
		this.metadata = new MetadataService(this.request);
		this.missing = new MissingService(this.request);
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
		this.renameEpisode = new RenameEpisodeService(this.request);
		this.rootFolder = new RootFolderService(this.request);
		this.seasonPass = new SeasonPassService(this.request);
		this.series = new SeriesService(this.request);
		this.seriesEditor = new SeriesEditorService(this.request);
		this.seriesImport = new SeriesImportService(this.request);
		this.seriesLookup = new SeriesLookupService(this.request);
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
