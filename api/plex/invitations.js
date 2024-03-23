const axios = require("axios");
const getConfig = require("../util/config");
const Library = require("../models/library");
const xmlParser = require("xml-js");

async function getLocalServer() {
  const config = getConfig();
  const res = await axios.get(
    `${config.plexProtocol}://${config.plexIp}:${config.plexPort}/?X-Plex-Token=${config.plexToken}`
  );
  return res.data.MediaContainer;
}

async function getDistantServer(localServer) {
  const config = getConfig();
  const res = await axios.get(
    `https://plex.tv/api/servers/${localServer.machineIdentifier}/?X-Plex-Token=${config.plexToken}`
  );

  const distantServer = JSON.parse(
    xmlParser.xml2json(res.data, { compact: true })
  );

  return distantServer;
}

async function getLibrarySectionIds(distantServer, libraries) {
  const librariesTitles = (
    await Promise.all(libraries.map((uuid) => Library.find({ uuid })))
  )?.map((l) => l[0].title);

  const librarySectionIds = distantServer?.MediaContainer?.Server?.Section?.map(
    (s) => s._attributes
  )
    .filter((s) => librariesTitles.includes(s.title))
    .map((s) => s.id);

  return librarySectionIds || [];
}

async function getInvitation(
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
      invited_email: plexUser.user.email,
    },
    sharing_settings: {
      allowSync: invitation.downloadPermitted,
    },
  };

  console.log(invitationRequest);

  try {
    const plexInvitation = await axios.post(invitationUrl, invitationRequest, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log(plexInvitation.data);
    return plexInvitation.data;
  } catch (error) {
    console.log(error.response.data);
  }
}

async function addUserToPlexServer(invitation, plexUser) {
  try {
    const localServer = await getLocalServer();
    const distantServer = await getDistantServer(localServer);
    const librarySectionIds = await getLibrarySectionIds(
      distantServer,
      invitation.libraries
    );
    await getInvitation(localServer, invitation, plexUser, librarySectionIds);
  } catch (e) {
    console.error(e);
    throw e;
  }
}

module.exports = addUserToPlexServer;
