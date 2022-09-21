import { useState, version } from 'react';

import { ReactComponent as ArrowIcon } from '../assets/svg/arrow.svg';
import typo from '../styles/components/typography.module.scss';
import styles from '../styles/views/tv.module.scss';
import Episode from './episode';

export default function Episodes({ data, mobile, globalRequests }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [currentSeasonData, setCurrentSeasonData] = useState(
    data.seasonData[
      Object.keys(data.seasonData).filter(
        (season) => data.seasonData[season].season_number === 1,
      )
    ],
  );
  const [expand, setExpand] = useState(false);
  const limit = mobile ? 1 : 2;

  function changeSeason(name) {
    const seasonRef = Object.keys(data.seasonData).filter(
      (season) => data.seasonData[season].name === name,
    );
    const seasonData = data.seasonData[seasonRef];
    setCurrentSeasonData(seasonData);
    setDropdownOpen(false);
    setExpand(false);
  }

  if (!currentSeasonData) return null;

  return (
    <div className={styles.episodes}>
      <div className="container">
        <div className={styles.episodes__top}>
          <p className={styles.episodes__title}>
            <span
              className={styles.episodes__title__dropdown}
              onClick={() => setDropdownOpen(dropdownOpen ? false : true)}
            >
              {currentSeasonData ? currentSeasonData.name : 'Unknown'}{' '}
              <ArrowIcon viewBox="0 0 12 20" />
            </span>{' '}
            <span className={typo.vertical_spacer}></span>{' '}
            {currentSeasonData.episodes.length} Episode
            {currentSeasonData.episodes.length !== 1 ? 's' : ''}
          </p>
          {dropdownOpen ? (
            <div className={styles.episodes__all}>
              <div className={styles.episodes__all__inner}>
                {data.seasons.map((season) => {
                  let style = {};
                  if (season.name === currentSeasonData.name) {
                    style = {
                      opacity: 0.5,
                      pointerEvents: 'none',
                    };
                  }
                  return (
                    <p
                      key={`season_${data.id}_${season.season_number}`}
                      className={styles.episodes__title}
                      style={style}
                      onClick={() => changeSeason(season.name)}
                    >
                      {season.name}
                    </p>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>

        <div className={styles.episodes__grid}>
          {currentSeasonData.episodes.map((episode, i) => {
            return (
              <Episode
                key={`season_${data.id}_e${episode.episode_number}`}
                data={data}
                episode={episode}
                i={i}
                limit={limit}
                expand={expand}
                globalRequests={globalRequests}
                mobile={mobile}
                seasonData={version.seasons}
                currentSeasonData={currentSeasonData}
              />
            );
          })}
        </div>
        {currentSeasonData.episodes.length > 2 ? (
          <div className={styles.episodes__more}>
            <p
              className={`${typo.body} ${typo.uppercase} ${typo.bold}`}
              onClick={() => setExpand(expand ? false : true)}
            >
              Show {expand ? 'less' : 'more'}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
