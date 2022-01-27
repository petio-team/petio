import typo from '../../styles/components/typography.module.scss';
import button from '../../styles/components/button.module.scss';

import oAuthWindow from '../../components/oAuthWindow';
import { plexAuth } from '../../services/plex.service';

export default function SetupAuth() {
	function loginOauth() {
		let plexWindow = oAuthWindow('', 'Login with Plex', 500, 500);
		plexAuth(plexWindow);
	}

	return (
		<div className="step-1">
			<p className={`${typo.body} mb-2`}>
				Welcome to Petio, firstly lets log in to Plex to get all of your
				user and server info
			</p>
			<button
				className={`${button.primary} ${button.auto}`}
				onClick={loginOauth}
			>
				Login with plex
			</button>
		</div>
	);
}
