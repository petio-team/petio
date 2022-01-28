import { useEffect, useRef, useState } from "react";
import styles from "../styles/components/modal.module.scss";

export default function Modal({ callback, children }) {
  const [pull, setPull] = useState("translateY(100%)");
  const [offset, setOffset] = useState(0);
  const [anim, setAnim] = useState(true);
  const inner = useRef(null);
  const bar = useRef(null);
  function handlePull(e) {
    if (anim) return false;
    const start = window.outerHeight * 0.3 + bar.current.offsetHeight * 0.5;
    const y = e.changedTouches[0].clientY;
    const off = y - start;
    if (off > 0) {
      setPull(`translateY(${Math.ceil(off)}px)`);
    }
    setOffset(off);
  }
  function handlePullEnd() {
    console.log(offset);
    if (offset > 150) {
      close();
    } else {
      setAnim(true);
      setTimeout(() => {
        setPull(`translateY(0)`);
      }, 100);
      setTimeout(() => {
        setAnim(false);
      }, 400);
    }
  }

  function close() {
    setAnim(true);
    setTimeout(() => {
      setPull(`translateY(100%)`);
    }, 200);
    setTimeout(() => {
      if (callback) callback();
      console.log(callback);
    }, 1400);
  }

  useEffect(() => {
    setTimeout(() => {
      setPull(`translateY(0)`);
    }, 1000);
    setTimeout(() => {
      setAnim(false);
    }, 1400);
  }, []);

  return (
    <>
      <div
        className={styles.blackout}
        onTouchStart={(e) => e.preventDefault()}
        onTouchMove={(e) => e.preventDefault()}
      ></div>
      <div className={styles.wrap}>
        <div
          ref={inner}
          className={`${styles.inner} ${anim ? styles.inner__anim : ""}`}
          style={{ transform: pull }}
        >
          <div
            ref={bar}
            className={styles.inner__pull}
            onTouchMove={handlePull}
            onTouchEnd={handlePullEnd}
          >
            <div className={styles.inner__pull__handle}></div>
          </div>
          {children}
        </div>
      </div>
    </>
  );
}
