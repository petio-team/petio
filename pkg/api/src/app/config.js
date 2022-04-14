const fs = require("fs");
const path = require("path");
const blueconfig = require('blueconfig');
const blueconfig_format_with_validator = require('blueconfig-format-with-validator');
const LISTOFERRORS = require('blueconfig/lib/error.js').LISTOFERRORS

const { dataFolder } = require('./env');

const CONFIG_FILE = path.join(dataFolder, './petio.json');

blueconfig.addFormats(blueconfig_format_with_validator);

blueconfig.addFormat({
  name: 'source-array',
  validate: function (children, schema, fullname) {
    const errors = [];

    if (!Array.isArray(children)) {
      throw new Error('must be an Array');
    }

    children.forEach((child, keyname) => {
      try {
        const conf = blueconfig(schema.children).merge(children[keyname]).validate();
        this.set(fullname + '.' + keyname, conf.getProperties());
      } catch (err) {
        err.parent = fullname + '.' + keyname;
        errors.push(err);
      }
    });

    if (errors.length !== 0) {
      throw new LISTOFERRORS(errors);
    }
  }
});

// Our config schema
const conf = blueconfig({
  general: {
    popular: {
      doc: 'Enabled showing popular media',
      format: Boolean,
      default: false,
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
    }
  },
  db: {
    url: {
      doc: 'The url of your mongo database',
      format: String,
      default: 'mongodb://127.0.0.1:27017/petio',
      env: 'DB_URL',
    },
  },
  notifications: {
    discord: {
      url: {
        doc: 'The webhook url for discord',
        format: String,
        default: "",
      }
    },
    telegram: {
      token: {
        doc: 'The telegram token for authentication',
        format: String,
        default: "",
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
    }
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
      default: "",
    },
    email: {
      doc: 'The email of the admin account',
      format: 'email',
      default: "admin@admin.com",
    },
    password: {
      doc: 'The generated hashed password for the admin account',
      format: String,
      default: "",
      sensitive: true,
    },
    thumbnail: {
      doc: 'The thumbnail url to be used as the avatar for the admin account',
      format: String,
      default: "",
      nullable: true,
    },
    display: {
      doc: 'The display name used for the admin account',
      format: String,
      default: "",
      nullable: true,
    }
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
      default: "",
      sensitive: true,
    },
    client: {
      doc: 'The client id',
      format: '*',
      default: -1,
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
      default: "",
    },
    password: {
      doc: 'The password required to authenticate',
      format: String,
      default: "",
      sensitive: true,
    },
    from: {
      doc: 'The account sending the email',
      format: String,
      default: "noreply@youremailserver.com",
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
        default: "",
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
        default: "",
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
        }
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
        }
      },
      uuid: {
        doc: 'The internal identifer for this instance',
        format: String,
        default: "",
      },
      enabled: {
        doc: 'Enables the use of this instance',
        format: Boolean,
        default: false,
      },
    }
  },
  radarr: {
    doc: 'A collection of radarr instances',
    format: 'source-array',
    default: [],
    children: {
      title: {
        doc: 'The instances display name',
        format: String,
        default: "",
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
        default: "",
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
        }
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
          default: "",
        }
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
        }
      },
      uuid: {
        doc: 'The internal identifer for this instance',
        format: String,
        default: "",
      },
      enabled: {
        doc: 'Enables the use of this instance',
        format: Boolean,
        default: false,
      },
    }
  }
});

const loadConfig = () => {
  if (fs.existsSync(CONFIG_FILE)) {
    try {
      conf.loadFile(CONFIG_FILE).validate();
    } catch (e) {
      if (e instanceof SyntaxError) {
        console.error("config is in an invalid format");
        console.info("if it can not be fixed, please delete it");
      }
      throw e;
    }
    return;
  }

  let oldConfig = GetLegacyConfig();
  if (oldConfig == null) {
    return;
  }

  MergeLegacyConfig(oldConfig);
  MergeLegacyEmailConfig(oldConfig.email);
  MergeLegacySonarrConfig(oldConfig.sonarr);
  MergeLegacyRadarrConfig(oldConfig.radarr);

  conf.validate();
  WriteConfig();
};

const WriteConfig = async () => {
  const data = JSON.stringify(conf.getProperties(), null, 2);
  fs.writeFile(CONFIG_FILE, data, (err) => {
    if (err) {
      throw err;
    }
  });
};

const GetLegacyConfig = () => {
  const configFile = path.join(dataFolder, 'config.json');
  const config = GetConfigFile(configFile);

  const emailFile = path.join(dataFolder, 'email.json');
  const emailConfig = GetConfigFile(emailFile);

  const radarrFile = path.join(dataFolder, 'radarr.json');
  const radarrConfig = GetConfigFile(radarrFile);

  const sonarrFile = path.join(dataFolder, 'sonarr.json');
  const sonarrConfig = GetConfigFile(sonarrFile);

  return {
    ...config,
    email: { ...emailConfig },
    sonarr: { ...sonarrConfig },
    radarr: { ...radarrConfig },
  };
};

const MergeLegacyConfig = (c) => {
  // db
  if (c.DB_URL != undefined) {
    conf.set('db.url', c.DB_URL);
  }
  // notifications
  if (c.discord_webhook != undefined) {
    conf.set('notifications.discord.url', c.discord_webhook);
  }
  if (c.telegram_bot_token != undefined) {
    conf.set('notifications.telegram.token', c.telegram_bot_token);
  }
  if (c.telegram_chat_id != undefined) {
    conf.set('notifications.telegram.id', c.telegram_chat_id);
  }
  if (c.telegram_send_silently != undefined) {
    conf.set('notifications.telegram.silent', c.telegram_send_silently);
  }
  // general
  if (c.plexPopular != undefined) {
    conf.set('general.popular', c.plexPopular);
  }
  // petio
  if (c.base_path != undefined) {
    conf.set('petio.subpath', c.base_path);
  }
  // plex
  if (c.plexProtocol != undefined) {
    conf.set('plex.protocol', c.plexProtocol);
  }
  if (c.plexIp != undefined) {
    conf.set('plex.host', c.plexIp);
  }
  if (c.plexPort != undefined) {
    conf.set('plex.port', c.plexPort);
  }
  if (c.plexToken != undefined) {
    conf.set('plex.token', c.plexToken);
  }
  if (c.plexClientID != undefined) {
    conf.set('plex.client', c.plexClientID);
  }
  // admin
  if (c.adminUsername != undefined) {
    conf.set('admin.username', c.adminUsername);
  }
  if (c.adminEmail != undefined) {
    conf.set('admin.email', c.adminEmail);
  }
  if (c.adminPass != undefined) {
    conf.set('admin.password', c.adminPass);
  }
  if (c.adminId != undefined) {
    conf.set('admin.id', c.adminId);
  }
  if (c.adminThumb != undefined) {
    conf.set('admin.thumbnail', c.adminThumb);
  }
  if (c.adminDisplayName != undefined) {
    conf.set('admin.display', c.adminDisplayName);
  }
};

const MergeLegacyEmailConfig = (c) => {
  if (c.emailEnabled != undefined) {
    conf.set('email.enabled', c.emailEnabled);
  }
  if (c.emailUser != undefined) {
    conf.set('email.username', c.emailUser);
  }
  if (c.emailPass != undefined) {
    conf.set('email.password', c.emailPass);
  }
  if (c.emailServer != undefined) {
    conf.set('email.host', c.emailServer);
  }
  if (c.emailPort != undefined) {
    conf.set('email.port', c.emailPort);
  }
  if (c.emailSecure != undefined) {
    conf.set('email.ssl', c.emailSecure);
  }
  if (c.emailFrom != undefined) {
    conf.set('email.from', c.emailFrom);
  }
};

const MergeLegacySonarrConfig = (c) => {
  if (c == null || typeof c !== 'object') {
    return;
  }

  if (c.length == 0) {
    return;
  }

  const data = [];
  for (const [_, i] of Object.entries(c)) {
    const item = {};
    item.enabled = Boolean(i.active);
    item.title = String(i.title);
    item.protocol = String(i.protocol);
    item.host = i.hostname;
    item.port = parseInt(i.port);
    item.key = i.apiKey;
    item.subpath = String(i.urlBase);
    if (item.subpath == "") {
      item.subpath = "/";
    }

    item.path = {};
    item.path.id = Number(i.path);
    item.path.location = String(i.path_title);

    item.profile = {};
    item.profile.id = Number(i.profile);
    item.profile.name = String(i.profile_title);
    item.uuid = i.uuid;

    data.push(item);
  };

  conf.set('sonarr', data);
};

const MergeLegacyRadarrConfig = (c) => {
  if (c == null || typeof c !== 'object') {
    return;
  }

  if (c.length == 0) {
    return;
  }

  const data = [];
  for (const [_, i] of Object.entries(c)) {
    const item = {};
    item.enabled = i.active;
    item.title = String(i.title);
    item.protocol = String(i.protocol);
    item.host = i.hostname;
    item.port = parseInt(i.port);
    item.key = i.apiKey;
    item.subpath = String(i.urlBase);
    if (item.subpath == "") {
      item.subpath = "/";
    }

    item.path = {};
    item.path.id = Number(i.path);
    item.path.location = String(i.path_title);

    item.profile = {};
    item.profile.id = Number(i.profile);
    item.profile.name = String(i.profile_title);
    item.uuid = i.uuid;

    data.push(item);
  };

  conf.set('radarr', data);
};

const GetConfigFile = (configFile) => {
  let config = {};
  try {
    const stat = fs.statSync(configFile);
    if (stat != null) {
      const file = fs.readFileSync(configFile);
      config = JSON.parse(file);
    }
  } catch (_) { }

  return config;
};


module.exports = {
  loadConfig,
  WriteConfig,
  conf,
};