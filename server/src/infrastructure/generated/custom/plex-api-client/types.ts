/**
 * Represents the data required to get the children metadata of a library item.
 */
export type GetMetadataChildrenData = {
  /**
   * The ID of the library item to return the children of.
   */
  ratingKey: number;

  /**
   * Optional. Specifies the elements to include in the response.
   */
  includeElements?: string;
};

/**
 * Represents the response object for getting metadata children.
 */
export type GetMetadataChildrenResponse = {
  MediaContainer?: {
    size?: number;
    allowSync?: boolean;
    art?: string;
    identifier?: string;
    key?: string;
    librarySectionID?: number;
    librarySectionTitle?: string;
    librarySectionUUID?: string;
    mediaTagPrefix?: string;
    mediaTagVersion?: number;
    nocache?: boolean;
    parentIndex?: number;
    parentTitle?: string;
    parentYear?: number;
    summary?: string;
    theme?: string;
    thumb?: string;
    title1?: string;
    title2?: string;
    viewGroup?: string;
    viewMode?: number;
    Directory?: Array<{
      leafCount?: number;
      thumb?: string;
      viewedLeafCount?: number;
      key?: string;
      title?: string;
    }>;
    Metadata?: Array<{
      ratingKey?: string;
      key?: string;
      parentRatingKey?: string;
      guid?: string;
      parentGuid?: string;
      parentStudio?: string;
      type?: string;
      title?: string;
      parentKey?: string;
      parentTitle?: string;
      summary?: string;
      index?: number;
      parentIndex?: number;
      viewCount?: number;
      lastViewedAt?: number;
      parentYear?: number;
      thumb?: string;
      art?: string;
      parentThumb?: string;
      parentTheme?: string;
      leafCount?: number;
      viewedLeafCount?: number;
      addedAt?: number;
      updatedAt?: number;
      userRating?: number;
      skipCount?: number;
      lastRatedAt?: number;
      Media?: Array<{
        id?: number;
        duration?: number;
        bitrate?: number;
        width?: number;
        height?: number;
        aspectRatio?: number;
        audioChannels?: number;
        audioCodec?: string;
        videoCodec?: string;
        videoResolution?: string;
        container?: string;
        videoFrameRate?: string;
        audioProfile?: string;
        videoProfile?: string;
        Part?: Array<{
          id?: number;
          key?: string;
          duration?: number;
          file?: string;
          size?: number;
          audioProfile?: string;
          container?: string;
          videoProfile?: string;
          Stream?: Array<{
            id?: number;
            streamType?: number;
            default?: boolean;
            codec?: string;
            index?: number;
            bitrate?: number;
            language?: string;
            languageTag?: string;
            languageCode?: string;
            bitDepth?: number;
            chromaLocation?: string;
            chromaSubsampling?: string;
            codedHeight?: number;
            codedWidth?: number;
            colorRange?: string;
            frameRate?: number;
            height?: number;
            level?: number;
            profile?: string;
            refFrames?: number;
            width?: number;
            displayTitle?: string;
            extendedDisplayTitle?: string;
          }>;
        }>;
      }>;
    }>;
  };
};

/**
 * Represents the data structure for retrieving session history.
 */
export type GetSessionHistoryData = {
  accountId?: number;
  sort?: string;
  'viewedAt>'?: number;
  librarySectionID?: number;
};

/**
 * Represents the data for getting bandwidth resources.
 */
export type GetBandwidthResourceData = {
  timespan: number;
};

/**
 * Represents the response structure for getting bandwidth resources.
 */
export type GetBandwidthResourceResponse = {
  MediaContainer: {
    size: number;
    Device: Array<{
      id: number;
      name: string;
      platform: string;
      clientIdentifier: string;
      createdAt: number;
    }>;
    Account: Array<{
      id: number;
      key: string;
      name: string;
      defaultAudioLanguage: string;
      autoSelectAudio: boolean;
      defaultSubtitleLanguage: string;
      subtitleMode: number;
      thumb: string;
    }>;
    StatisticsBandwidth: Array<{
      accountID: number;
      deviceID: number;
      timespan: number;
      at: number;
      lan: boolean;
      bytes: number;
    }>;
  };
};

/**
 * Represents the data structure for getting statistics resource data.
 */
export type GetStatisticsResourcesData = {
  timespan: number;
};

/**
 * Represents the response structure for getting statistics resources.
 */
export type GetStatisticsResourcesResponse = {
  MediaContainer: {
    size: number;
    StatisticsResources: Array<{
      timespan: number;
      at: number;
      hostCpuUtilization: number;
      processCpuUtilization: number;
      hostMemoryUtilization: number;
      processMemoryUtilization: number;
    }>;
  };
};

/**
 * Represents the parameters for getting the top content from a library.
 */
export type GetLibraryTopContentData = {
  type: number;
  accountId?: string;
  'viewedAt>'?: number;
  limit?: number;
};

/**
 * Represents the response object for getting the top content from the library.
 */
export type GetLibraryTopContentResponse = {
  MediaContainer?: {
    size?: number;
    allowSync?: boolean;
    identifier?: string;
    mediaTagPrefix?: string;
    mediaTagVersion?: number;
    Metadata?: Array<{
      ratingKey?: string;
      key?: string;
      guid?: string;
      slug?: string;
      studio?: string;
      type?: string;
      title?: string;
      librarySectionTitle?: string;
      librarySectionID?: number;
      librarySectionKey?: string;
      contentRating?: string;
      summary?: string;
      index?: number;
      audienceRating?: number;
      year?: number;
      thumb?: string;
      art?: string;
      theme?: string;
      duration?: number;
      originallyAvailableAt?: string;
      leafCount?: number;
      viewedLeafCount?: number;
      childCount?: number;
      addedAt?: number;
      updatedAt?: number;
      globalViewCount?: number;
      userCount?: number;
      audienceRatingImage?: string;
      Genre?: Array<{
        tag?: string;
      }>;
      Country?: Array<{
        tag?: string;
      }>;
      Role?: Array<{
        tag?: string;
      }>;
      User?: Array<{
        id?: number;
      }>;
      originalTitle?: string;
      titleSort?: string;
      primaryExtraKey?: string;
      tagline?: string;
      seasonCount?: number;
    }>;
  };
};
