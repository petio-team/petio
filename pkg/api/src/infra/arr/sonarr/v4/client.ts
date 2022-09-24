import { asApi, Zodios } from "@zodios/core";
import { pluginHeader } from "@zodios/plugins";
import { LanguageEndpoint } from "./language";
import { QueueEndpoint } from "./queue";

const endpoints = asApi([
  ...LanguageEndpoint,
  ...QueueEndpoint,
]);

export default (url: URL, token: string) => {
  const client = new Zodios(url.toString(), endpoints);
  client.use(pluginHeader('x-api-key', async () => token));
  return client;
};
