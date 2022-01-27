import media from '../../../services/media.service';

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/opacity.css';

import { Loading } from '../../../components/loading';
import Meta from '../../../components/meta';
import Hero from '../../../components/hero';
import Grid from '../../../components/grid';

import hero from '../../../styles/components/hero.module.scss';
import styles from '../../../styles/views/company.module.scss';
import NotFound from '../../404';
// import type from '../../../styles/components/typography.module.scss';

export default function Network() {
	const [coData, setCoData] = useState(null);
	const [tv, setTv] = useState(false);
	const [total, setTotal] = useState(1);
	const [featuredShow, setFeaturedMovie] = useState(false);
	const { pid } = useParams();

	useEffect(() => {
		async function getCoDetails() {
			try {
				const showData = await media.getNetwork(pid);
				const tvLookup = await media.lookup('show', 1, {
					with_networks: pid,
				});
				setCoData(showData);
				setTv(tvLookup.results);
				setTotal(tvLookup.totalPages);
				setFeaturedMovie(tvLookup.results[0]);
			} catch (e) {
				console.log(e);
				setCoData('error');
			}
		}

		getCoDetails();
	}, [pid]);

	if (!coData) return <Loading />;

	if (coData === 'error') return <NotFound />;

	return (
		<div className={styles.wrap} key={`network_single_${pid}`}>
			<Meta title={coData.name} />
			<div className={`${hero.discovery} ${hero.company}`}>
				<div className="container">
					<div
						className={`${hero.discovery__content} ${hero.company__content}`}
					>
						<div className={hero.company__logo}>
							{coData.logo_path ? (
								<LazyLoadImage
									src={`https://image.tmdb.org/t/p/w780_filter(duotone,ffffff,bdbdbd)${coData.logo_path}`}
									alt={coData.name}
									effect="opacity"
									visibleByDefault={true}
								/>
							) : (
								<p>{coData.name}</p>
							)}
						</div>
					</div>
				</div>
				<div className={hero.company__background}>
					{featuredShow ? (
						<Hero
							className={hero.discovery__image}
							image={featuredShow.backdrop_path}
						/>
					) : null}
				</div>
			</div>
			<Grid
				title={`${coData.name} Shows`}
				data={tv}
				type="tv"
				key={`network_${pid}_tv`}
			/>
		</div>
	);
}
