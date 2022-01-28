import styles from "../styles/components/modal.module.scss";

export default function Modal() {
  function handlePull(e) {
    const target = e.target;
    const x = e.changedTouches[0].clientX;
    console.log(x);
  }
  return (
    <>
      <div className={styles.blackout}></div>
      <div className={styles.wrap}>
        <div className={styles.inner}>
          <div className={styles.inner__pull} onTouchMove={handlePull}></div>
          content
        </div>
      </div>
    </>
  );
}
