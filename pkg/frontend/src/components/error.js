// import Router from 'next/router';
import { useState, useEffect } from "react";
import styles from "../styles/components/error.module.scss";
import typo from "../styles/components/typography.module.scss";
// import { useRouter } from 'next/router';

import Meta from "../components/meta";

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
      <Meta title={"Error"} />
      <div className={styles.wrap}>
        <div className="container">
          <p className={`${typo.xltitle} ${typo.bold}`}>Oops</p>
          <p className={`${typo.title} ${typo.medium}`}>Something went wrong</p>
          <br />
          <p className={`${typo.body}`}>
            Petio can't connect to the API service. If the issue persists please
            contact your server admin.
          </p>
          <br />
          <p className={`${typo.body} ${typo.medium}`}>
            Retrying in {countdown}
          </p>
        </div>
      </div>
    </>
  );
}
