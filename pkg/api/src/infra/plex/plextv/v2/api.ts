import { makeApi } from "@zodios/core";
import { CompanionsEndpoint } from "./companions";
import { FriendsEndpoint } from "./friends";
import { PinsEndpoint } from "./pins";
import { ResourcesEndpoint } from "./resources";
import { UserEndpoint } from "./user";

// eslint-disable-next-line import/prefer-default-export
export const APIv2 = makeApi([
  ...UserEndpoint,
  ...FriendsEndpoint,
  ...ResourcesEndpoint,
  ...PinsEndpoint,
  ...CompanionsEndpoint,
]);
