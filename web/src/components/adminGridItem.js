import typo from '../styles/components/typography.module.scss';
import styles from '../styles/views/adminSettings.module.scss';

export default function AdminGridItem({ children, title }) {
  return (
    <div>
      <div className={styles.grid__item}>
        <div className={styles.grid__item__title}>
          <p className={`${typo.body} ${typo.uppercase} ${typo.medium}`}>
            {title}
          </p>
        </div>
        <div className={styles.grid__item__content}>{children}</div>
      </div>
    </div>
  );
}
