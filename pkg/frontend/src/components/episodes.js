import { useState, useEffect } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';

import { ReactComponent as ArrowIcon } from '../assets/svg/arrow.svg';

import styles from '../styles/views/tv.module.scss';
import typo from '../styles/components/typography.module.scss';

export default function Episodes({ data, mobile }) {
	const [dropdownOpen, setDropdownOpen] = useState(false);
	const [currentSeasonData, setCurrentSeasonData] = useState(
		data.seasonData[
			Object.keys(data.seasonData).filter(
				(season) => data.seasonData[season].season_number == 1
			)
		]
	);
	const [expand, setExpand] = useState(false);
	const limit = mobile ? 1 : 2;

	function changeSeason(name) {
		const seasonRef = Object.keys(data.seasonData).filter(
			(season) => data.seasonData[season].name == name
		);
		const seasonData = data.seasonData[seasonRef];
		setCurrentSeasonData(seasonData);
		setDropdownOpen(false);
		setExpand(false);
	}

	return (
		<div className={styles.episodes}>
			<div className="container">
				<div className={styles.episodes__top}>
					<p className={styles.episodes__title}>
						<span
							className={styles.episodes__title__dropdown}
							onClick={() =>
								setDropdownOpen(dropdownOpen ? false : true)
							}
						>
							{currentSeasonData.name}{' '}
							<ArrowIcon viewBox="0 0 12 20" />
						</span>{' '}
						<span className={typo.vertical_spacer}></span>{' '}
						{currentSeasonData.episodes.length} Episode
						{currentSeasonData.episodes.length !== 1 ? 's' : ''}
					</p>
					{dropdownOpen ? (
						<div className={styles.episodes__all}>
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
										onClick={() =>
											changeSeason(season.name)
										}
									>
										{season.name}
									</p>
								);
							})}
						</div>
					) : null}
				</div>

				<div className={styles.episodes__grid}>
					{currentSeasonData.episodes.map((episode, i) => {
						if (i > limit && !expand) return null;
						return (
							<div
								className={styles.episode}
								key={`season_${data.id}_e${episode.episode_number}`}
							>
								<div className={styles.episode__image}>
									{episode.still_path ? (
										<LazyLoadImage
											src={`https://image.tmdb.org/t/p/w500${episode.still_path}`}
											alt={episode.name}
											// effect="opacity"
										/>
									) : (
										<div
											className={
												styles.episode__image__placeholder
											}
										>
											<p
												className={`${typo.smtitle} ${typo.medium} ${styles.no_poster}`}
											>
												{episode.name}
											</p>
										</div>
									)}
								</div>
								<p
									className={`${typo.body} ${typo.uppercase} ${typo.medium} ${styles.episode__number}`}
								>
									Episode {episode.episode_number}
								</p>
								<p
									className={`${typo.body} ${styles.episode__name}`}
								>
									{episode.name}
								</p>
								{mobile ? null : (
									<p
										className={`${typo.body} ${styles.episode__overview}`}
									>
										{episode.overview.length > 160
											? episode.overview.substring(
													0,
													157
											  ) + '...'
											: episode.overview}
									</p>
								)}
							</div>
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
