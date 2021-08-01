import * as Settings from "./settings";
import * as T from "./types";

import path from "path";

const testDir = path.join(process.cwd(), "src", "settings", "__test__");

test("validate resource availability", async () => {
  const file = path.join(testDir, "full.yaml");

  expect(await Settings.IsResourceAvailable(file)).toStrictEqual(true);
});

test("load settings file", async () => {
  const file = path.join(testDir, "full.yaml");
  const data: T.Config = {
    discovery: {
      popular: true,
    },
    plex: {
      ip: "127.0.0.1",
      port: 9000,
      token: "RGKsgNx?Yqf?m8T7Y7H9kpTDn9k9",
      clientId: "EaotctDr7nNYnyYT7m6kBmK4YRm5o94a9Q7NPMqP",
    },
    admin: {
      id: 763878558877,
      username: "admin",
      email: "admin@admin.com",
      password: "RzMQCRmaPYHkSNdQGSBXfsYRnpF6xDR7ixx45tRa",
      thumbnail: "https://plex.tv/users/i7kXR6fcyCd7bQXz/avatar?c=6657756667",
      displayName: "Admin",
    },
    notifications: {
      discord: {
        webhook:
          "https://discord.com/api/webhooks/446698948436349783/o8-xhNXdisoyKApR3Lq-tjYeFS4KTGHDXodT8cEQng7D7XTqNEMhMntHRzso07-zHJN5",
        enabled: true,
      },
      telegram: {
        token: "&Q#&5nqC#SnKXriHm&GJ@XJ5&85@",
        enabled: false,
      },
    },
  };

  expect(await Settings.LoadSettingsFile(file)).toStrictEqual(data);
});

test("load legacy config files", async () => {
  const dir = path.join(testDir, "oldConfigs");
  const data: T.LegacyConfigs = {
    sonarr: [
      {
        title: "TV",
        hostname: "sonarr.domain.co.uk",
        protocol: "https",
        apiKey: "79666654333889484489567897795339",
        port: "443",
        urlBase: "/base_path",
        path: "2",
        path_title: "/mnt/unionfs/tv-4k",
        profile: "7",
        profile_title: "4K",
        uuid: "77d7aadd-decd-40e8-9a76-7079a8d16e5f",
        active: true,
      },
    ],
    radarr: [
      {
        title: "4K",
        hostname: "radarr.domain.co.uk",
        protocol: "https",
        apiKey: "9dcd45a7406141b78978406d8ccc9ca6",
        port: "443",
        urlBase: "/base_path",
        path: "3",
        path_title: "/mnt/unionfs/movies-4k",
        profile: "7",
        profile_title: "4K",
        uuid: "08108733-3b30-46cd-af4c-111af03d7f4e",
        active: true,
      },
    ],
    email: {
      emailUser: "user@user.com",
      emailPass: "xxLq7z6Y@pbB49qhbqLaB6Q7DDfA",
      emailServer: "emailserver@emailserver.com",
      emailPort: "25",
      emailSecure: true,
      emailEnabled: true,
    },
    config: {
      DB_URL: "mongodb://192.168.1.10:27017/petio",
      tmdbApi: "Eizb6EBc&B$G$S!5fBCd4b!xazGJ",
      plexProtocol: "https",
      plexIp: "12-34-87-177.fyAE5mgr8RzGGhzjBycCFgHGgbzX.petio.direct",
      plexPort: "32400",
      plexToken: "fyAE5mgr8RzGGhzjBycCFgHGgbzX",
      plexClientID: "BeTX8bRYjPTS47qhn3xphgp6eEHJnDhL9eBmTfgY",
      adminUsername: "admin",
      adminEmail: "admin@admin.com",
      adminPass: "$2a$10$anGB9e7mJLDDC3HOa.dEtui1XhWtepHGqPJk1gpks80wXUD07QcNq",
      adminId: "34385839843",
      adminThumb: "https://plex.tv/users/sadsdasdasad/avatar?c=asddsadsdsaasd",
      adminDisplayName: "admin",
      fanartApi: "Eizb6EBc&B$G$S!5fBCd4b!xazGJ",
      base_path: "/base_path",
      plexPopular: true,
      discord_webhook:
        "https://discord.com/api/webhooks/446698948436349783/o8-xhNXdisoyKApR3Lq-tjYeFS4KTGHDXodT8cEQng7D7XTqNEMhMntHRzso07-zHJN5",
      telegram_bot_token: "my_telegram_token",
      telegram_chat_id: "my_telegram_chat_id",
      telegram_send_silently: true,
    },
  };

  expect(await Settings.LoadLegacyConfigFiles(dir)).toStrictEqual(data);
});

test("parse legacy config files into a new schema", async () => {
  const dir = path.join(testDir, "oldConfigs");
  const configs = await Settings.LoadLegacyConfigFiles(dir);
  const data: T.Config = {
    discovery: {
      popular: true,
    },
    plex: {
      ip: "12-34-87-177.fyAE5mgr8RzGGhzjBycCFgHGgbzX.petio.direct",
      port: 32400,
      token: "fyAE5mgr8RzGGhzjBycCFgHGgbzX",
      clientId: "BeTX8bRYjPTS47qhn3xphgp6eEHJnDhL9eBmTfgY",
      protocol: "https",
    },
    admin: {
      id: 34385839843,
      username: "admin",
      email: "admin@admin.com",
      password: "$2a$10$anGB9e7mJLDDC3HOa.dEtui1XhWtepHGqPJk1gpks80wXUD07QcNq",
      thumbnail: "https://plex.tv/users/sadsdasdasad/avatar?c=asddsadsdsaasd",
      displayName: "admin",
    },
    notifications: {
      discord: {
        webhook:
          "https://discord.com/api/webhooks/446698948436349783/o8-xhNXdisoyKApR3Lq-tjYeFS4KTGHDXodT8cEQng7D7XTqNEMhMntHRzso07-zHJN5",
        enabled: true,
      },
      telegram: {
        token: "my_telegram_token",
        chatId: "my_telegram_chat_id",
        silent: true,
        enabled: true,
      },
      email: {
        address: "emailserver@emailserver.com",
        username: "user@user.com",
        password: "xxLq7z6Y@pbB49qhbqLaB6Q7DDfA",
        port: 25,
        secure: true,
        enabled: true,
      },
    },
    instances: [
      {
        type: "sonarr",
        title: "TV",
        protocol: "https",
        port: 443,
        hostname: "sonarr.domain.co.uk",
        apiKey: "79666654333889484489567897795339",
        baseUrl: "/base_path",
        pathId: 2,
        path: "/mnt/unionfs/tv-4k",
        profileId: 7,
        profile: "4K",
        uuid: "77d7aadd-decd-40e8-9a76-7079a8d16e5f",
        active: true,
      },
      {
        type: "radarr",
        title: "4K",
        protocol: "https",
        port: 443,
        hostname: "radarr.domain.co.uk",
        apiKey: "9dcd45a7406141b78978406d8ccc9ca6",
        baseUrl: "/base_path",
        pathId: 3,
        path: "/mnt/unionfs/movies-4k",
        profileId: 7,
        profile: "4K",
        uuid: "08108733-3b30-46cd-af4c-111af03d7f4e",
        active: true,
      },
    ],
  };

  expect(Settings.UpgradeLegacyConfigs(configs)).toStrictEqual(data);
});

test("write settings data to file", async () => {
  const source = path.join(testDir, "petio.yaml");
  const data: T.Config = {
    discovery: {
      popular: true,
    },
    plex: {
      ip: "12-34-87-177.fyAE5mgr8RzGGhzjBycCFgHGgbzX.petio.direct",
      port: 32400,
      token: "fyAE5mgr8RzGGhzjBycCFgHGgbzX",
      clientId: "BeTX8bRYjPTS47qhn3xphgp6eEHJnDhL9eBmTfgY",
      protocol: "https",
    },
    admin: {
      id: 34385839843,
      username: "admin",
      email: "admin@admin.com",
      password: "$2a$10$anGB9e7mJLDDC3HOa.dEtui1XhWtepHGqPJk1gpks80wXUD07QcNq",
      thumbnail: "https://plex.tv/users/sadsdasdasad/avatar?c=asddsadsdsaasd",
      displayName: "admin",
    },
    notifications: {
      discord: {
        webhook:
          "https://discord.com/api/webhooks/446698948436349783/o8-xhNXdisoyKApR3Lq-tjYeFS4KTGHDXodT8cEQng7D7XTqNEMhMntHRzso07-zHJN5",
        enabled: true,
      },
      telegram: {
        token: "my_telegram_token",
        chatId: "my_telegram_chat_id",
        silent: true,
        enabled: true,
      },
      email: {
        address: "emailserver@emailserver.com",
        username: "user@user.com",
        password: "xxLq7z6Y@pbB49qhbqLaB6Q7DDfA",
        port: 25,
        secure: true,
        enabled: true,
      },
    },
    instances: [
      {
        type: "sonarr",
        title: "TV",
        protocol: "https",
        port: 443,
        hostname: "sonarr.domain.co.uk",
        apiKey: "79666654333889484489567897795339",
        baseUrl: "/base_path",
        pathId: 2,
        path: "/mnt/unionfs/tv-4k",
        profileId: 7,
        profile: "4K",
        uuid: "77d7aadd-decd-40e8-9a76-7079a8d16e5f",
        active: true,
      },
      {
        type: "radarr",
        title: "4K",
        protocol: "https",
        port: 443,
        hostname: "radarr.domain.co.uk",
        apiKey: "9dcd45a7406141b78978406d8ccc9ca6",
        baseUrl: "/base_path",
        pathId: 3,
        path: "/mnt/unionfs/movies-4k",
        profileId: 7,
        profile: "4K",
        uuid: "08108733-3b30-46cd-af4c-111af03d7f4e",
        active: true,
      },
    ],
  };

  await Settings.WriteConfig(source, data);
  expect(await Settings.LoadSettingsFile(source)).toStrictEqual(data);
});
