import { connect } from "react-redux";

const mapStateToProps = (state) => {
  return {
    requests: state.user.requests,
    redux_movies: state.media.movies,
    redux_tv: state.media.tv,
  };
};

function Activity() {
  return <p>Activity</p>;
}

export default connect(mapStateToProps)(Activity);
