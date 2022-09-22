import tableStyle from '../styles/components/table.module.scss';
import styles from '../styles/views/users.module.scss';

export default function UserProfiles({ profiles, sonarr, radarr }) {
  return (
    <table className={`${tableStyle.rounded} ${styles.table}`}>
      <thead>
        <tr>
          <th>Name</th>
          <th>Default</th>
          <th>Sonarr</th>
          <th>Radarr</th>
          <th>Auto Approve Movie</th>
          <th>Auto Approve TV</th>
          <th>Quota (per week)</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Default</td>
          <td>
            {profiles
              ? search('isDefault', true, profiles)
                ? 'No'
                : 'Yes'
              : 'Yes'}
          </td>
          <td>All</td>
          <td>All</td>
          <td>No</td>
          <td>No</td>
          <td>∞</td>
          <td>None</td>
        </tr>
        {profiles && profiles.length > 0
          ? profiles.map((profile) => {
              let sActive = false;
              let rActive = false;
              return (
                <tr key={`profile__${profile._id}`}>
                  <td>{profile.name}</td>
                  <td>{profile.isDefault ? 'Yes' : 'No'}</td>
                  <td>
                    {profile.sonarr
                      ? Object.keys(profile.sonarr).length > 0
                        ? Object.keys(profile.sonarr).map((s) => {
                            if (!profile.sonarr[s]) return null;
                            sActive = true;
                            let server = findServerByUuid(s, sonarr);
                            let serverName = server
                              ? server.title
                              : 'Not Found';
                            return (
                              <span
                                key={`${profile._id}_${s}`}
                                className="requests--status requests--status__sonarr"
                              >
                                {serverName}
                              </span>
                            );
                          })
                        : null
                      : null}
                    {!sActive ? 'None' : null}
                  </td>
                  <td>
                    {profile.radarr
                      ? Object.keys(profile.radarr).length > 0
                        ? Object.keys(profile.radarr).map((r) => {
                            if (!profile.radarr[r]) return null;
                            rActive = true;
                            let server = findServerByUuid(r, radarr);
                            let serverName = server
                              ? server.title
                              : 'Not Found';

                            return (
                              <span
                                key={`${profile._id}_${r}`}
                                className="requests--status requests--status__radarr"
                              >
                                {serverName}
                              </span>
                            );
                          })
                        : null
                      : null}
                    {!rActive ? 'None' : null}
                  </td>
                  <td>{profile.autoApprove ? 'Yes' : 'No'}</td>
                  <td>{profile.autoApproveTv ? 'Yes' : 'No'}</td>
                  <td>{profile.quota === 0 ? '∞' : profile.quota}</td>
                  <td>
                    {/* <p
                className="table-action"
                onClick={() => {
                  this.props.openModal('addProfile');

                  this.setActiveProfile(profile._id);
                }}
              >
                Edit
              </p> */}
                  </td>
                </tr>
              );
            })
          : null}
      </tbody>
    </table>
  );
}

function search(key, value, myArray) {
  for (var i = 0; i < myArray.length; i++) {
    if (myArray[i][key] === value) {
      return myArray[i];
    }
  }
}

function findServerByUuid(uuid, servers) {
  if (!servers) return false;
  for (let s in servers) {
    let server = servers[s];
    if (server.uuid === uuid) {
      return server;
    }
  }
  return false;
}
