import styles from '../styles/views/requests.module.scss';
import typo from '../styles/components/typography.module.scss';

import Meta from '../components/meta';
import Request from '../components/request';
import { connect } from 'react-redux';
import { useEffect } from 'react';

import media from '../services/media.service';
import { myRequests, myRequestsArchive } from '../services/user.service';

const mapStateToProps = (state) => {
	return {
		requests: state.user.myRequests,
		currentUser: state.user.currentUser,
	};
};

function Requests({ requests, currentUser }) {
	useEffect(() => {
		if (!currentUser.id) return;
		myRequests();
		myRequestsArchive(currentUser.id);
	}, [currentUser]);

	useEffect(() => {
		if (!requests) return;
		let tv = [];
		let movie = [];
		Object.keys(requests).map((id) => {
			const request = requests[id];
			if (request.type === 'movie') movie.push(id);
			if (request.type === 'tv') tv.push(id);
		});
		media.batchLookup(tv, 'tv', false);
		media.batchLookup(movie, 'movie', false);
	}, [requests]);

	return (
		<div className={styles.wrap}>
			<Meta title={`Your Requests`} />
			<div className="container">
				<p className={`${styles.title} ${typo.xltitle} ${typo.bold}`}>
					Your Requests
				</p>
				<p className={`${typo.bold} ${typo.uppercase} ${typo.body}`}>
					Active Requests
				</p>
				<div className={styles.grid}>
					{requests &&
					Object.keys(requests).length > 0 &&
					currentUser ? (
						Object.keys(requests).map((id) => {
							const request = requests[id];
							if (
								request.users.includes(
									currentUser.id.toString()
								)
							)
								return (
									<Request
										request={request}
										key={`request_${id}`}
									/>
								);
						})
					) : (
						<p
							className={`${styles.grid__noresults} ${typo.body} ${typo.bold}`}
						>
							You don't have any active requests
						</p>
					)}
				</div>
				<p className={`${typo.bold} ${typo.uppercase} ${typo.body}`}>
					Archive Requests
				</p>
				<div className={styles.archive}>archive</div>
			</div>
		</div>
	);
}

export default connect(mapStateToProps)(Requests);
