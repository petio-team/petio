import { ReactComponent as ThumbDown } from '../assets/svg/thumb-down.svg';
import { ReactComponent as ThumbUp } from '../assets/svg/thumb-up.svg';
import { getReviews, saveReview } from '../services/user.service';
import buttons from '../styles/components/button.module.scss';

export default function ReviewButtons({
  styles,
  redux_reviews,
  currentUser,
  data,
  newNotification,
}) {
  async function review(type) {
    if (!type) return;
    try {
      await saveReview(data, currentUser.id, type === 'good' ? 10 : 1);
      await getReviews();
    } catch (e) {
      console.log(e);
      newNotification({
        message: 'Failed to save review',
        type: 'error',
      });
    }
  }

  function isReviewed() {
    if (data && redux_reviews && redux_reviews.length > 0 && currentUser) {
      const review = redux_reviews.filter((r) => {
        return r.tmdb_id === data.id.toString() && r.user === currentUser.id;
      });
      if (review && review[0] && review[0].score) return review[0].score;
      return false;
    }
  }

  const reviewed = isReviewed();

  return (
    <>
      <button
        className={`${buttons.icon} ${styles.actions__btn} ${
          reviewed === 10 ? styles.actions__btn__up : ''
        }`}
        onClick={() => review('good')}
      >
        <ThumbUp viewBox="0 0 24 24" />
      </button>
      <button
        className={`${buttons.icon} ${styles.actions__btn} ${
          reviewed === 1 ? styles.actions__btn__down : ''
        }`}
        onClick={() => review('bad')}
      >
        <ThumbDown viewBox="0 0 24 24" />
      </button>
    </>
  );
}
