import React from "react";
import Api from "../data/Api";
import Carousel from "../components/Carousel";
import PersonCard from "../components/PersonCard";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
// import CarouselLoading from "../components/CarouselLoading";
// import CarouselLoadingPerson from "../components/CarouselLoadingPerson";

class People extends React.Component {
  componentDidMount() {
    Api.getPopular();
  }

  render() {
    return (
      <>
        <section>
          <h1 className="main-title mb--1">People</h1>
          <p style={{ margin: 0 }}>Discover Actors, Cast &amp; Crew</p>
        </section>
        <section>
          <h3 className="sub-title mb--1">Trending People</h3>
          <Carousel>
            {Object.keys(this.props.api.popular).length > 0
              ? this.props.api.popular.people.map((person) => {
                  return <PersonCard key={person.id} person={person} />;
                })
              : null}
          </Carousel>
        </section>
      </>
    );
  }
}

People = withRouter(People);

function PeopleContainer(props) {
  return <People api={props.api} />;
}

const mapStateToProps = function (state) {
  return {
    api: state.api,
  };
};

export default connect(mapStateToProps)(PeopleContainer);
