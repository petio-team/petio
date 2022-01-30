import { connect } from "react-redux";
import styles from "../../styles/views/admin.module.scss";

const mapStateToProps = (state) => {
  return {
    requests: state.user.requests,
    redux_movies: state.media.movies,
    redux_tv: state.media.tv,
  };
};

function Issues() {
  return (
    <div className={styles.dashboard__module}>
      <p>Issues</p>
    </div>
  );
}

export default connect(mapStateToProps)(Issues);
