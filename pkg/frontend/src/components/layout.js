import Nav from './nav';
import Footer from './footer';

import styles from '../styles/components/page.module.scss';

export default function Layout({ isLoggedIn, children, currentUser }) {
	return (
		<div className={styles.wrap}>
			{isLoggedIn ? <Nav currentUser={currentUser} /> : null}
			<main className={styles.content}>{children}</main>
			{isLoggedIn ? <Footer /> : null}
		</div>
	);
}
