import carousel from '../styles/components/carousel.module.scss';
import typo from '../styles/components/typography.module.scss';
import cards from '../styles/components/card.module.scss';

import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';
// import { useRouter } from 'next/router';

import Card from './card';
import { useEffect, useRef } from 'react';

const mapStateToProps = (state) => {
	return {
		redux_pos: state.pos.pages,
	};
};

function Carousel({ data, title, type = 'movie', id, redux_pos }) {
	const placeholderRow = [];
	const rowId = id;
	// const router = useRouter();
	const track = useRef(null);
	const history = useHistory();

	for (let i = 0; i < 10; i++) {
		placeholderRow.push(
			<div className={cards.wrap} key={`${rowId}_${i}`}>
				<div
					className={
						type === 'company'
							? cards.placeholder__wide
							: cards.placeholder
					}
				></div>
			</div>
		);
	}

	useEffect(() => {
		if (!track || !data || data.length === 0) return;
		const current = history.location.pathname;
		const reduxPage = redux_pos[current];
		if (reduxPage) {
			const carousels = reduxPage.carousels;
			if (!carousels) return;
			const thisCarousel = carousels[id];
			if (thisCarousel) {
				track.current.scrollLeft = thisCarousel.scroll;
			}
		}
	}, [history.location.pathname, track, data]);

	return (
		<div className="container">
			<div className={carousel.wrap}>
				<p className={typo.carousel_title}>
					{title ? title : 'Loading...'}
				</p>
				<div
					className={`${carousel.track} carousel-store`}
					id={rowId}
					ref={track}
				>
					{data && data.length > 0
						? data.map((item, i) => {
								if (item === 'watched') return null;
								const video =
									item.videos &&
									item.videos.results.length > 0
										? item.videos.results[0].key
										: false;
								const date =
									type === 'movie'
										? item.release_date
										: type === 'tv'
										? item.first_air_date
										: '';
								const poster =
									type === 'movie' || type === 'tv'
										? item.poster_path
										: type === 'people'
										? item.profile_path
										: item.logo_path;
								if (
									typeof item === 'string' ||
									typeof item === 'number'
								)
									item = { id: item, load: true };
								return (
									<Card
										key={`${rowId}__carousel__${item.id}__${i}`}
										title={
											type === 'movie'
												? item.title
												: item.name
										}
										poster={poster}
										video={video}
										year={
											date
												? new Date(date).getFullYear()
												: false
										}
										type={type}
										id={item.id}
										character={item.character}
										credit={item.credit}
										name={item.name}
										item={item}
										load={item.load}
									/>
								);
						  })
						: placeholderRow}
				</div>
			</div>
		</div>
	);
}

export default connect(mapStateToProps)(Carousel);
