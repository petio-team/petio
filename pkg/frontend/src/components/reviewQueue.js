import styles from "../styles/views/myAccount.module.scss";
import typo from "../styles/components/typography.module.scss";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/opacity.css";
import { ReactComponent as ThumbUp } from "../assets/svg/thumb-up.svg";
import { ReactComponent as ThumbDown } from "../assets/svg/thumb-down.svg";
import buttons from "../styles/components/button.module.scss";

export default function ReviewQueue({ history }) {
  const reviewed = false;
  return (
    <div className={styles.reviewQueue}>
      {!history ? (
        <p
          className={`${styles.reviewQueue__empty} ${typo.smtitle} ${typo.medium}`}
        >
          Loading
        </p>
      ) : Object.keys(history).length > 0 ? (
        Object.keys(history).map((i) => {
          const item = history[i];
          if (!item.id) return null;
          return (
            <div
              key={`reviewq__${item.id}`}
              className={styles.reviewQueue__item}
            >
              <div className={styles.reviewQueue__item__inner}>
                <div className={styles.reviewQueue__item__image}>
                  {item.backdrop_path ? (
                    <>
                      <LazyLoadImage
                        className={styles.reviewQueue__item__image__img}
                        src={`https://image.tmdb.org/t/p/w780${item.backdrop_path}`}
                        effect="opacity"
                      />
                      {item.logo ? (
                        <div className={styles.reviewQueue__item__logo}>
                          <LazyLoadImage
                            className={styles.reviewQueue__item__logo__img}
                            src={item.logo}
                            effect="opacity"
                          />
                        </div>
                      ) : (
                        <p
                          className={`${styles.reviewQueue__item__logo__text} ${typo.smtitle} ${typo.medium} ${styles.no_logo}`}
                        >
                          {item.title || item.name}
                        </p>
                      )}
                    </>
                  ) : (
                    <p
                      className={`${typo.smtitle} ${typo.medium} ${styles.reviewQueue__item__noLogo}`}
                    >
                      {item.title || item.name}
                    </p>
                  )}
                </div>
                <div className={styles.reviewQueue__item__content}>
                  <p className={`${typo.body} ${typo.medium}`}>
                    {item.title || item.name}
                    {item.first_air_date
                      ? ` (${new Date(item.first_air_date).getFullYear()})`
                      : item.release_date
                      ? ` ${new Date(item.release_date).getFullYear()})`
                      : ""}
                  </p>
                  <div className={styles.reviewQueue__item__btns}>
                    <button
                      className={`${buttons.icon} ${styles.actions__btn} ${
                        reviewed === 10 ? styles.actions__btn__up : ""
                      }`}
                      // onClick={() => review("good")}
                    >
                      <ThumbUp viewBox="0 0 24 24" />
                    </button>
                    <button
                      className={`${buttons.icon} ${styles.actions__btn} ${
                        reviewed === 1 ? styles.actions__btn__down : ""
                      }`}
                      // onClick={() => review("bad")}
                    >
                      <ThumbDown viewBox="0 0 24 24" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <p
          className={`${styles.reviewQueue__empty} ${typo.smtitle} ${typo.medium}`}
        >
          Your queue is empty
        </p>
      )}
    </div>
  );
}
