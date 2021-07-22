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
