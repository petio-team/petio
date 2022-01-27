import { connect } from "react-redux";
import { Login } from "../../components/login";

const mapStateToProps = (state) => {
  return {
    redux_user: state.user,
  };
};

function Admin({
  redux_user,
  newNotification,
  config,
  setCurrentUser,
  setIsLoggedIn,
}) {
  function setLoadingScreen() {
    return;
  }

  if (redux_user.isAdminLogin)
    return <p>Admin: {redux_user.isAdminLogin.toString()}</p>;

  return (
    <Login
      config={{ login_type: 1 }}
      setIsLoggedIn={setIsLoggedIn}
      setCurrentUser={setCurrentUser} // fix this to redux globally <----
      setLoadingScreen={setLoadingScreen}
      newNotification={newNotification}
    />
  );
}

export default connect(mapStateToProps)(Admin);
