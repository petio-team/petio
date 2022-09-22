import Meta from '../components/meta';
import typo from '../styles/components/typography.module.scss';

export default function NotFound() {
  return (
    <div className="container">
      <Meta title={'404'} />

      <div className="e404">
        <h1 className={typo.xltitle}>404</h1>
        <p className={typo.title}>Page not found</p>
      </div>
    </div>
  );
}
