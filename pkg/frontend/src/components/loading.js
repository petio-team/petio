import { ReactComponent as Spinner } from '../assets/svg/spinner.svg';
import Meta from './meta';

export function Loading() {
	return (
		<div className="loading-screen">
			<Meta title={'...'} />
			<Spinner />
		</div>
	);
}
