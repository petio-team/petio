import { randomUUID } from 'crypto';

import { generateKeys } from '@/utils/security';

import blueconfig from './blueconfig';
import sourceArray from './formats/source-array';

// MAX SECURTIY KEYS
const MAX_SECURITY_KEYS = 10;

blueconfig.addFormat(sourceArray);

export const config = blueconfig({
  general: {
    popular: {
      doc: 'Enabled showing popular media',
      format: Boolean,
      default: false,
    },
    concurrency: {
      doc: 'The concurrency limit amount for concurrent operations',
      format: Number,
      default: 10,
    },
  },
  petio: {
    host: {
      doc: 'The ip address of the host',
      format: 'ipaddress',
      default: '127.0.0.1',
      env: 'PETIO_HOST',
      arg: 'host',
    },
    port: {
      doc: 'The port to listen to on the host',
      format: 'port',
      default: 7777,
      env: 'PETIO_PORT',
      arg: 'port',
    },
    subpath: {
      doc: 'The sub path added to the end of host',
      format: String,
      default: '/',
      env: 'PETIO_SUBPATH',
      arg: 'subpath',
    },
    proxies: {
      doc: 'Trusted proxy addresses',
      format: Array,
      default: [],
      env: 'PETIO_TRUSTED_PROXIES',
    },
    keys: {
      doc: 'A list of keys used to encrypt data',
      format: Array,
      default: generateKeys(MAX_SECURITY_KEYS),
    },
  },
  logger: {
    level: {
      doc: 'The level of output the log provides',
      format: ['error', 'warn', 'info', 'verbose', 'debug', 'silly'],
      default: 'info',
      env: 'LOG_LEVEL',
      args: 'loglevel',
    },
  },
  auth: {
    type: {
      doc: 'The type of auth to use',
      format: [1, 2],
      default: 1,
    },
  },
  db: {
    url: {
      doc: 'The url of your mongo database',
      format: String,
      default: 'mongodb://127.0.0.1:27017/petio',
      env: 'DB_URL',
    },
  },
  tasks: {
    library: {
      full: {
        doc: 'The interval time for performing a full plex library scan',
        format: String,
        default: '1 day',
      },
      partial: {
        doc: 'The interval time for performing a partial plex library scan',
        format: String,
        default: '30 minutes',
      },
    },
    quotas: {
      doc: 'The interval time for performing a reset of user quotas',
      format: String,
      default: '0 11 * * sun',
    },
  },
  notifications: {
    discord: {
      url: {
        doc: 'The webhook url for discord',
        format: String,
        default: '',
      },
    },
    telegram: {
      token: {
        doc: 'The telegram token for authentication',
        format: String,
        default: '',
      },
      id: {
        doc: 'The id of the chat',
        format: Number,
        default: -1,
      },
      silent: {
        doc: 'Enable to prevent being notified of messages',
        format: Boolean,
        default: false,
      },
    },
  },
  admin: {
    id: {
      doc: 'The id of the admin account',
      format: '*',
      default: -1,
    },
    username: {
      doc: 'The username of the admin account',
      format: String,
      default: '',
    },
    email: {
      doc: 'The email of the admin account',
      format: 'email',
      default: 'admin@admin.com',
    },
    password: {
      doc: 'The generated hashed password for the admin account',
      format: String,
      default: '',
      sensitive: true,
    },
    thumbnail: {
      doc: 'The thumbnail url to be used as the avatar for the admin account',
      format: String,
      default: '',
      nullable: true,
    },
    display: {
      doc: 'The display name used for the admin account',
      format: String,
      default: '',
      nullable: true,
    },
  },
  plex: {
    protocol: {
      doc: 'The http protocol to use',
      format: ['http', 'https'],
      default: 'http',
    },
    host: {
      doc: 'The hostname or ip address',
      format: '*',
      default: '127.0.0.1',
    },
    port: {
      doc: 'The instances remote port',
      format: 'port',
      default: 32400,
    },
    token: {
      doc: 'The token used to authenticate',
      format: String,
      default: '',
      sensitive: true,
    },
    client: {
      doc: 'The client id',
      format: '*',
      default: 'petio_' + randomUUID(),
      sensitive: true,
    },
  },
  email: {
    host: {
      doc: 'The address of the email server',
      format: String,
      default: '',
    },
    port: {
      doc: 'The port of the email server',
      format: Number,
      default: 587,
    },
    username: {
      doc: 'The username required to authenticate',
      format: String,
      default: '',
    },
    password: {
      doc: 'The password required to authenticate',
      format: String,
      default: '',
      sensitive: true,
    },
    from: {
      doc: 'The account sending the email',
      format: String,
      default: 'noreply@youremailserver.com',
    },
    ssl: {
      doc: 'Use the SSL protocol',
      format: Boolean,
      default: false,
    },
    enabled: {
      doc: 'Enable the email client',
      format: Boolean,
      default: false,
    },
  },
  sonarr: {
    doc: 'A collection of sonarr instances',
    format: 'source-array',
    default: [],
    children: {
      title: {
        doc: 'The instances display name',
        format: String,
        default: '',
      },
      protocol: {
        doc: 'The http protocol to use',
        format: ['http', 'https'],
        default: 'http',
      },
      host: {
        doc: 'The hostname or ip address',
        format: '*',
        default: '127.0.0.1',
      },
      port: {
        doc: 'The instances remote port',
        format: 'port',
        default: 8989,
      },
      subpath: {
        doc: 'The sub path the instance is hosted on',
        format: String,
        default: '/',
      },
      key: {
        doc: 'The key used to authenticate',
        format: String,
        default: '',
        sensitive: true,
      },
      path: {
        id: {
          doc: 'The id of the path',
          format: Number,
          default: 0,
        },
        location: {
          doc: 'The location of the path',
          format: String,
          default: '',
        },
      },
      profile: {
        id: {
          doc: 'The id of the profile',
          format: Number,
          default: 0,
        },
        name: {
          doc: 'The name of the profile',
          format: String,
          default: '',
        },
      },
      language: {
        id: {
          doc: 'The id of the language profile',
          format: Number,
          default: 0,
        },
        name: {
          doc: 'The name of the language profile',
          format: String,
          default: '',
        },
      },
      uuid: {
        doc: 'The internal identifer for this instance',
        format: String,
        default: '',
      },
      enabled: {
        doc: 'Enables the use of this instance',
        format: Boolean,
        default: false,
      },
    },
  },
  radarr: {
    doc: 'A collection of radarr instances',
    format: 'source-array',
    default: [],
    children: {
      title: {
        doc: 'The instances display name',
        format: String,
        default: '',
      },
      protocol: {
        doc: 'The http protocol to use',
        format: ['http', 'https'],
        default: 'http',
      },
      host: {
        doc: 'The hostname or ip address',
        format: '*',
        default: '127.0.0.1',
      },
      port: {
        doc: 'The instances remote port',
        format: 'port',
        default: 7878,
      },
      subpath: {
        doc: 'The sub path the instance is hosted on',
        format: String,
        default: '/',
      },
      key: {
        doc: 'The key used to authenticate',
        format: String,
        default: '',
        sensitive: true,
      },
      path: {
        id: {
          doc: 'The id of the path',
          format: Number,
          default: 0,
        },
        location: {
          doc: 'The location of the path',
          format: String,
          default: '',
        },
      },
      profile: {
        id: {
          doc: 'The id of the profile',
          format: Number,
          default: 0,
        },
        name: {
          doc: 'The name of the profile',
          format: String,
          default: '',
        },
      },
      language: {
        id: {
          doc: 'The id of the language profile',
          format: Number,
          default: 0,
        },
        name: {
          doc: 'The name of the language profile',
          format: String,
          default: 'Default',
        },
      },
      uuid: {
        doc: 'The internal identifer for this instance',
        format: String,
        default: '',
      },
      enabled: {
        doc: 'Enables the use of this instance',
        format: Boolean,
        default: false,
      },
    },
  },
});
