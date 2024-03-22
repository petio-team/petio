import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import {
  useHistory,
  useParams,
} from "react-router-dom/cjs/react-router-dom.min";
import { ReactComponent as Spinner } from "../assets/svg/spinner.svg";
import Api from "../data/Api";
import { Stepper } from "../components/Stepper";

function Invitation(props) {
  const { msg } = props;

  const { code } = useParams();
  const history = useHistory();

  const [invitation, setInvitation] = useState(null);

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

  useEffect(() => {
    checkCode(code);
  }, [code]);

  if (!invitation) {
    return (
      <div className="login-wrap">
        <div className="spinner">
          <Spinner />
        </div>
      </div>
    );
  }

  return (
    <div className="login-wrap">
      <Stepper
        steps={[
          {
            title: "Step 1",
            subtitle: "Sub Step 1",
            content: (
              <div>
                <h2>Step 1</h2>
                <p>Step 1 content</p>
              </div>
            ),
          },
          {
            title: "Step 2",
            subtitle: "Sub Step 2",
            content: (
              <div>
                <h2>Step 2</h2>
                <p>Step 2 content</p>
              </div>
            ),
          },
          {
            title: "Step 3",
            subtitle: "Sub Step 3",
            content: (
              <div>
                <h2>Step 3</h2>
                <p>
                  {`What is Lorem Ipsum? Lorem Ipsum is simply dummy text of the
                  printing and typesetting industry. Lorem Ipsum has been the
                  industry's standard dummy text ever since the 1500s, when an
                  unknown printer took a galley of type and scrambled it to make
                  a type specimen book. It has survived not only five centuries,
                  but also the leap into electronic typesetting, remaining
                  essentially unchanged. It was popularised in the 1960s with
                  the release of Letraset sheets containing Lorem Ipsum
                  passages, and more recently with desktop publishing software
                  like Aldus PageMaker including versions of Lorem Ipsum. Why do
                  we use it? It is a long established fact that a reader will be
                  distracted by the readable content of a page when looking at
                  its layout. The point of using Lorem Ipsum is that it has a
                  more-or-less normal distribution of letters, as opposed to
                  using 'Content here, content here', making it look like
                  readable English. Many desktop publishing packages and web
                  page editors now use Lorem Ipsum as their default model text,
                  and a search for 'lorem ipsum' will uncover many web sites
                  still in their infancy. Various versions have evolved over the
                  years, sometimes by accident, sometimes on purpose (injected
                  humour and the like). Where does it come from? Contrary to
                  popular belief, Lorem Ipsum is not simply random text. It has
                  roots in a piece of classical Latin literature from 45 BC,
                  making it over 2000 years old. Richard McClintock, a Latin
                  professor at Hampden-Sydney College in Virginia, looked up one
                  of the more obscure Latin words, consectetur, from a Lorem
                  Ipsum passage, and going through the cites of the word in
                  classica`}
                </p>
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
