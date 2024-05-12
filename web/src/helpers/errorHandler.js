import React from 'react';

import typo from '../styles/components/typography.module.scss';
import styles from '../styles/views/errorHandler.module.scss';

export default class ErrorHandler extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: false };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    this.props.newNotification({
      type: 'error',
      message: 'An error has occured',
    });
    console.log(error, errorInfo);
    this.setState({ error: error });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className={styles.wrap}>
          <div className="container">
            <h1 className={`${typo.bold} ${typo.title}`}>
              Something went wrong.
            </h1>
            <p className={`${typo.smtitle} ${typo.capped}`}>
              Congrats, you found a bug. Please report this to your server
              admin. If you are the server admin please report this to us on
              Discord or GitHub.
            </p>
            <div className={styles.errorBlock}>
              <code
                dangerouslySetInnerHTML={{
                  __html: this.state.error ? this.state.error.stack : '',
                }}
              ></code>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
