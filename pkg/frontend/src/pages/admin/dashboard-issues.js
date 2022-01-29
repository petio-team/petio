import { connect } from "react-redux";

const mapStateToProps = (state) => {
  return {
    requests: state.user.requests,
    redux_movies: state.media.movies,
    redux_tv: state.media.tv,
  };
};

function Issues() {
  return <p>Issues</p>;
}

export default connect(mapStateToProps)(Issues);
