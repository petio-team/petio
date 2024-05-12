import { useEffect, useState } from 'react';
import { connect } from 'react-redux';

import UserProfiles from '../../components/userProfiles';
import { getRadarr, getSonarr } from '../../services/config.service';
import { getProfiles } from '../../services/user.service';
import inputs from '../../styles/components/input.module.scss';
import tableStyle from '../../styles/components/table.module.scss';
import typo from '../../styles/components/typography.module.scss';
import styles from '../../styles/views/users.module.scss';

const mapStateToProps = (state) => {
  return {
    redux_users: state.user.users,
  };
};

function AdminUsers({ redux_users }) {
  const [profiles, setProfiles] = useState(false);
  const [radarr, setRadarr] = useState(false);
  const [sonarr, setSonarr] = useState(false);

  useEffect(() => {
    async function profiles() {
      const profilesData = await getProfiles();
      setProfiles(profilesData);
    }

    async function getArrs() {
      const sonarrServers = await getSonarr();
      const radarrServers = await getRadarr();
      setSonarr(sonarrServers);
      setRadarr(radarrServers);
    }

    profiles();
    getArrs();
    // eslint-disable-next-line
  }, []);

  function findProfile(id) {
    for (let p in profiles) {
      let profile = profiles[p];
      if (profile._id === id) {
        return profile;
      }
    }
    return false;
  }

  return (
    <div className="container">
      <div className={styles.title}>
        <p className={`${typo.title} ${typo.bold}`}>Users</p>
      </div>
      <div className={styles.subtitle}>
        <p className={`${typo.smtitle} ${typo.bold}`}>Profiles</p>
        <p className={`${typo.body} ${typo.capped}`}>
          User profiles determine what should happen when a user makes a
          request. If using Sonarr / Radarr you can pick which servers the
          request is sent to. You can also choose to allow auto approval for
          certain users.
        </p>
      </div>
      <UserProfiles profiles={profiles} sonarr={sonarr} radarr={radarr} />
      <div className={styles.smtitle}>
        <p className={`${typo.smtitle} ${typo.bold}`}>Users</p>
      </div>
      <table className={`${tableStyle.rounded} ${styles.table2}`}>
        <thead>
          <tr>
            <th>
              <div className={inputs.checkboxes__item}>
                <input type="checkbox" style={{ margin: 0 }} />
              </div>
            </th>
            <th>Title</th>
            <th>Username</th>
            <th>Email</th>
            <th>Role</th>
            <th>Profile</th>
            <th>Active</th>
            <th>Last IP</th>
            <th>Last Login</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {redux_users && redux_users.length > 0
            ? redux_users.map((user) => {
                const userProfile = user.profile
                  ? findProfile(user.profile)
                  : { name: 'default' };
                return (
                  <tr key={user.id}>
                    <td>
                      <div className={inputs.checkboxes__item}>
                        <input type="checkbox" style={{ margin: 0 }} />
                      </div>
                    </td>
                    <td>
                      {user.title} {user.custom ? '(Custom)' : ''}
                    </td>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>{user.role ? user.role : 'user'}</td>
                    <td>{userProfile ? userProfile.name : 'Removed'}</td>
                    <td>
                      <div className="table-icon">
                        {user.disabled ? 'Disabled' : 'Active'}
                      </div>
                    </td>
                    <td>{user.lastIp ? user.lastIp : 'n/a'}</td>
                    <td>
                      {user.lastLogin
                        ? `${new Date(user.lastLogin).toDateString()}`
                        : 'n/a'}
                    </td>
                    <td>
                      {/* <p
                        className="table-action"
                        onClick={() => {
                          this.openModal('editUser');
                          this.setActiveUser(user._id);
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
    </div>
  );
}

export default connect(mapStateToProps)(AdminUsers);
