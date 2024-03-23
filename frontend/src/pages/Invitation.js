import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import {
  useHistory,
  useParams,
} from "react-router-dom/cjs/react-router-dom.min";
import { ReactComponent as Spinner } from "../assets/svg/spinner.svg";
import Api from "../data/Api";
import { Stepper } from "../components/Stepper";
import { popupCenter } from "../App";
import User from "../data/User";

function Invitation(props) {
  const { msg } = props;

  const { code } = useParams();
  const history = useHistory();

  const [invitation, setInvitation] = useState(null);
  const [redirectUrl, setRedirectUrl] = useState();

  async function checkCode(code) {
    try {
      const res = await Api.checkInvitationCode(code);
      console.log(res.invitation);
      setInvitation(res.invitation);
    } catch (error) {
      msg({
        type: "error",
        message: error.message,
      });
      setTimeout(() => history.push("/"), 3000);
    }
  }

  async function register(setIndex) {
    try {
      const plexWindow = popupCenter("", "Register on Plex", 700, 2300);
      const plexUser = await User.plexAuth(plexWindow);
      setIndex((step) => step + 1);
      const res = await Api.acceptInvitation(plexUser, code);
      console.log(res);
      setRedirectUrl(res.redirectUrl);
    } catch (error) {
      msg({
        type: "error",
        message: error.message,
      });
      setIndex((step) => step - 1);
    }
  }

  useEffect(() => {
    checkCode(code);
  }, [code]);

  if (!invitation) {
    return (
      <div className="inscription-wrap">
        <div className="spinner">
          <Spinner />
        </div>
      </div>
    );
  }

  return (
    <div className="inscription-wrap">
      <Stepper
        steps={[
          {
            title: "Informations",
            subtitle: "Information about the use of plex",
            content: (
              <div>
                <h2>User Acknowledgement for the Plex Server Rules</h2>
                <p className="rootPadding">
                  As a user of this Plex server, I acknowledge and commit to the
                  following:
                </p>
                <h3>Understanding the Rules</h3>
                <p>
                  I have read and understood the rules and guidelines provided
                  by the server administrator.
                </p>
                <p>
                  I will ask for clarification if any rule or guideline is
                  unclear to me.
                </p>
                <h3>Respecting the Guidelines</h3>
                <p>
                  I will not upload or request inappropriate or illegal content
                  on the server.
                </p>
                <p>
                  I will treat all users with respect and courtesy, avoiding
                  conflicts and disruptive behavior.
                </p>
                <h3>Privacy and Security</h3>
                <p>
                  I will protect my account details and not share them with
                  anyone else.
                </p>
                <p>
                  I will respect the privacy of other users and not share their
                  personal information without consent.
                </p>
                <h3>Content Usage</h3>
                <p>
                  I will adhere to the server’s content guidelines, including
                  any restrictions on sharing or accessing specific types of
                  content.
                </p>
                <h3>Resource Utilization</h3>
                <p>
                  I will be mindful of my use of server resources, such as
                  bandwidth and storage, to ensure fair access for all users.
                </p>
                <h3>Compliance with Updates and Maintenance</h3>
                <p>
                  I will comply with any server maintenance schedules and adapt
                  to changes or updates as required.
                </p>
                <h3>Legal and Ethical Conduct</h3>
                <p>
                  I understand that my use of the Plex server should comply with
                  all applicable laws and ethical guidelines.
                </p>
                <h3>Reporting Issues</h3>
                <p>
                  I will report any issues or suspicious activities to the
                  server administrator in a timely manner.
                </p>
                <p className="rootPadding">
                  By continuing to use this Plex server, I agree to adhere to
                  these rules and understand that failure to comply may result
                  in my access being revoked.
                </p>
              </div>
            ),
          },
          {
            title: "Registration",
            subtitle: "Create a plex account",
            nextButton: ({ setIndex }) => (
              <button
                className="btn btn__square"
                onClick={() => register(setIndex)}
              >
                Register
              </button>
            ),
            content: (
              <div>
                <h2>Information about types of registration</h2>
                <h3>1. Registration by e-mail address</h3>
                <p>
                  How does it work? You provide a valid e-mail address and
                  create a password. You{"'"}ll need to use this e-mail address
                  and password every time you log in to your Plex account.
                </p>
                <p>
                  <span className="bold">Advantages: </span> This method allows
                  you to keep your Plex account completely independent of other
                  online services. This can be a good option if you prefer not
                  to link your social media accounts to streaming services.
                </p>
                <p>
                  <span className="bold">Disadvantages: </span> You need to
                  remember another password. If you use several e-mail
                  addresses, you{"'"}ll need to remember the one you used to
                  sign up for Plex.
                </p>
                <h3>2. Registration via Google</h3>
                <p>
                  How does it work? You use your existing Google account to
                  register. Plex will retrieve the basic information from your
                  Google profile to create your account.
                </p>
                <p>
                  <span className="bold">Benefits: </span> If you already use
                  Google for other services, this method can simplify your login
                  process by allowing you to use the same credentials. It can
                  also speed up the sign-up process, as some information will be
                  filled in automatically.
                </p>
                <p>
                  <span className="bold">Disadvantages: </span> Your Plex
                  account will be linked to your Google account. If your Google
                  account is compromised, your Plex account could be too.
                </p>
                <h3>3. Registration via Facebook</h3>
                <p>
                  How does it work? Similar to registering via Google, you use
                  your existing Facebook account to create a Plex account. Plex
                  will use some of your Facebook information to set up your
                  account.
                </p>
                <p>
                  <span className="bold">Advantages: </span> This method is
                  convenient if you
                  {"'"}re frequently connected to Facebook and prefer to use
                  your Facebook credentials to access various services.
                </p>
                <p>
                  <span className="bold">Disadvantages: </span> As with Google,
                  linking your Plex account to your Facebook account means that
                  the security of your Plex account is directly linked to that
                  of your Facebook account.{" "}
                </p>
                <h3>4. Registration via Apple</h3>
                <p>
                  How does it work? If you own an Apple device or use Apple ID,
                  you can register for Plex using your Apple ID. This method
                  works well for those who are part of the Apple ecosystem.
                </p>
                <p>
                  <span className="bold">Benefits: </span> Using Apple ID for
                  registration can be more secure thanks to the one-time
                  password functionality and two-step verification offered by
                  Apple. What{"'"}s more, you can choose to hide your real
                  e-mail address from Plex, enhancing your privacy.
                </p>
                <p>
                  <span className="bold">Disadvantages: </span> If you don{"'"}t
                  regularly use Apple products or services, this option may be
                  less relevant to you. What{"'"}s more, if you lose access to
                  your Apple account, you may also find it difficult to access
                  your Plex account.{" "}
                </p>
                <p className="rootPadding">
                  Each registration method has its advantages and disadvantages,
                  and the best option depends on your personal preferences and
                  your use of other online services. It{"'"}s important to
                  choose a method that suits your online habits and your
                  security and privacy concerns.
                </p>
              </div>
            ),
          },
          {
            title: "Welcome !",
            subtitle: "Welcome to the plex server !",
            nextButton: () => (
              <button
                className="btn btn__square"
                disabled={!redirectUrl}
                onClick={() => (window.location.href = redirectUrl)}
              >
                Go watch films now !
              </button>
            ),
            content: redirectUrl ? (
              <div>
                <h2>Welcome to Our Plex Server!</h2>
                <p>
                  Hello and welcome! We{"'"}re thrilled to have you on board.
                  Our Plex server is a place where we share and enjoy a
                  fantastic collection of movies, TV shows, music, and more. We
                  hope you find something you like and enjoy your time here.
                </p>
                <p>
                  As a new member, we kindly ask that you review our{" "}
                  <a href="#">Rules and Guidelines</a> to ensure a pleasant
                  experience for everyone. Please remember to respect others and
                  the content shared on this server.
                </p>
                <p>
                  If you have any questions or need assistance, don{"'"}t
                  hesitate to reach out. We{"'"}re here to help!
                </p>
                <p>Enjoy your viewing,</p>
                <p>
                  <span className="bold">The Plex Server Team</span>
                </p>
              </div>
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Spinner />
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}

const mapStateToProps = (state) => ({ api: state.api });
export default connect(mapStateToProps)(Invitation);
