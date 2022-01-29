import { connect } from "react-redux";

const mapStateToProps = (state) => {
  return {
    requests: state.user.requests,
    redux_movies: state.media.movies,
    redux_tv: state.media.tv,
  };
};

function Metrics() {
  return <p>Metrics</p>;
}

export default connect(mapStateToProps)(Metrics);
