import path from "path";
import * as Config from "./config";
import * as T from "./types";

test("load config file", async () => {
  const file = path.join(
    process.cwd(),
    "config",
    "__test__",
    "full_config.yaml"
  );
  let data: T.Config = {
    discovery: {
      popular: true,
    },
    thirdpartyapis: {
      tmdb: "6DgcB?iQn!XPQ9d46ttH@sBaAF8&",
      fanart: "xK!j?SN$8zMocYBsD3hgx?R&JJzp",
    },
    plex: {
      ip: "127.0.0.1",
      port: 9000,
      token: "RGKsgNx?Yqf?m8T7Y7H9kpTDn9k9",
      clientId: "EaotctDr7nNYnyYT7m6kBmK4YRm5o94a9Q7NPMqP",
    },
    db: {
      url: "mongodb://127.0.0.1:9077/petio",
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

  expect(await Config.LoadConfig(file)).toStrictEqual(data);
});

test("load legacy config files", async () => {
  const dir = path.join(process.cwd(), "config", "__test__", "oldConfigs");
  let data: T.LegacyConfigs = {
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

  expect(await Config.LoadLegacyConfigs(dir)).toStrictEqual(data);
});
