import { asApi } from '@zodios/core';

import { FriendsEndpoint } from './v2/friends';
import { PinsEndpoint } from './v2/pins';
import { ResourcesEndpoint } from './v2/resources';
import { UserEndpoint } from './v2/user';

export const APIv2 = asApi([
  ...UserEndpoint,
  ...FriendsEndpoint,
  ...ResourcesEndpoint,
  ...PinsEndpoint,
] as const);
