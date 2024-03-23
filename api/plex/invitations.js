const axios = require("axios");
const getConfig = require("../util/config");
const Library = require("../models/library");
const xmlParser = require("xml-js");

async function acceptUserInvitation(plexUserIdentity) {
  let invitation;

  try {
    const res = await axios.get(
      `https://plex.tv/api/invites/requests?X-Plex-Token=${plexUserIdentity.authToken}`
    );

    invitation = JSON.parse(xmlParser.xml2json(res.data, { compact: false }))
      ?.elements?.[0]?.elements?.map((i) => i.attributes)
      .find((i) => i.email === getConfig().adminEmail);

    if (!invitation) {
      throw new Error("Invitation not found");
    }
  } catch (error) {
    console.error(error);
    throw new Error("Failed to get user invitation");
  }

  try {
    await axios.put(
      `https://plex.tv/api/invites/requests/${invitation.id}?X-Plex-Token=${plexUserIdentity.authToken}&friend=${invitation.friend}&server=${invitation.server}&home=${invitation.home}`
    );
  } catch (error) {
    console.error(error);
    throw new Error("Failed to accept user invitation");
  }
}

async function getPlexUser(plexUserIdentity) {
  try {
    const res = await axios.get(
      `https://plex.tv/api/v2/user?X-Plex-Token=${plexUserIdentity.authToken}`
    );
    return res.data;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to get plex user");
  }
}

async function getLocalServer() {
  try {
    const config = getConfig();
    const res = await axios.get(
      `${config.plexProtocol}://${config.plexIp}:${config.plexPort}/?X-Plex-Token=${config.plexToken}`
    );
    return res.data.MediaContainer;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to get local server");
  }
}

async function getDistantServer(localServer) {
  try {
    const config = getConfig();
    const res = await axios.get(
      `https://plex.tv/api/servers/${localServer.machineIdentifier}/?X-Plex-Token=${config.plexToken}`
    );

    const distantServer = JSON.parse(
      xmlParser.xml2json(res.data, { compact: true })
    );

    return distantServer;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to get distant server");
  }
}

async function getLibrarySectionIds(distantServer, libraries) {
  try {
    const librariesTitles = (
      await Promise.all(libraries.map((uuid) => Library.find({ uuid })))
    )?.map((l) => l[0].title);

    const librarySectionIds =
      distantServer?.MediaContainer?.Server?.Section?.map((s) => s._attributes)
        .filter((s) => librariesTitles.includes(s.title))
        .map((s) => s.id);

    return librarySectionIds || [];
  } catch (error) {
    console.error(error);
    throw new Error("Failed to get library section ids");
  }
}

async function addInvitation(
  localServer,
  invitation,
  plexUser,
  librarySectionIds
) {
  const config = getConfig();
  const invitationUrl = `https://plex.tv/api/servers/${localServer.machineIdentifier}/shared_servers/?X-Plex-Token=${config.plexToken}`;

  const invitationRequest = {
    server_id: localServer.machineIdentifier,
    shared_server: {
      library_section_ids: librarySectionIds,
      invited_email: plexUser.email,
    },
    sharing_settings: {
      allowSync: invitation.downloadPermitted,
    },
  };

  try {
    await axios.post(invitationUrl, invitationRequest, {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    const error = JSON.parse(
      xmlParser.xml2json(err.response.data, { compact: true })
    );
    throw new Error(error.Response._attributes.status);
  }
}

async function addUserToPlexServer(invitation, plexUserIdentity) {
  const localServer = await getLocalServer();
  const distantServer = await getDistantServer(localServer);
  const librarySectionIds = await getLibrarySectionIds(
    distantServer,
    invitation.libraries
  );

  await addInvitation(
    localServer,
    invitation,
    plexUserIdentity,
    librarySectionIds
  );

  await acceptUserInvitation(plexUserIdentity);
}

module.exports = {
  addUserToPlexServer,
  getPlexUser,
  getLocalServer,
  getDistantServer,
  getLibrarySectionIds,
  addInvitation,
};
