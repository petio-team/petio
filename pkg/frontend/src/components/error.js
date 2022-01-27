// import Router from 'next/router';
import { useState, useEffect } from 'react';
// import { useRouter } from 'next/router';

import Meta from '../components/meta';

export default function Error(props) {
	const [countdown, setCountdown] = useState(30);
	// const r = useRouter();

	useEffect(() => {
		if (countdown === 0) {
			window.location.reload();
		} else {
			setTimeout(() => {
				setCountdown(countdown - 1);
			}, 1000);
		}
	});

	return (
		<>
			<Meta title={'Error'} />
			<p>Error: {props.msg}</p>
			<p>Retrying in {countdown}</p>
		</>
	);
}
