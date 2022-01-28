import { connect } from "react-redux";
import { Login } from "../../components/login";
import Modal from "../../components/modal";

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
    return (
      <div>
        <p>Admin: {redux_user.isAdminLogin.toString()}</p>
        <Modal>Modal content test</Modal>
      </div>
    );

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
