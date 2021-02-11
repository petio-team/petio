import React from "react";
import Api from "../../data/Api";

class Console extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      console: false,
    };

    this.getConsole = this.getConsole.bind(this);
  }
  componentDidMount() {
    this.heartbeat = setInterval(() => this.getConsole(), 1000);
  }

  async getConsole() {
    let data = await Api.getConsole();
    if (data) {
      data = data.reverse();
    }
    this.setState({
      console: data,
    });
  }

  componentWillUnmount() {
    clearInterval(this.heartbeat);
  }

  render() {
    return (
      <div className="console--wrap">
        <p className="main-title mb--2">Debug Console</p>
        <div className="console--main">
          {this.state.console
            ? this.state.console.map((log) => {
                let timestamp = Object.keys(log)[0];
                let type = log[timestamp].type;
                let message = log[timestamp].log;
                return (
                  <p
                    key={`con__${timestamp}_${message}`}
                    className={`console--item console--item__${type}`}
                  >
                    [{timestamp}] ::{" "}
                    <span className={`console--type console--type__${type}`}>
                      {type}
                    </span>{" "}
                    :: {message}
                  </p>
                );
              })
            : null}
        </div>
      </div>
    );
  }
}

export default Console;
